import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { exec } from 'child_process';
import { YamlNode, NodeType } from './yamlNode';
import * as executer from './executer';

export class ProjectInitProvider implements vscode.TreeDataProvider<YamlNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<YamlNode | undefined> = new vscode.EventEmitter<YamlNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<YamlNode | undefined> = this._onDidChangeTreeData.event;
	private _apis: Array<YamlNode> = [];
	private _models: Array<YamlNode> = [];
	private _modelProps: any = {};
	private _hideUnModel: boolean = false;
	private _inits: Array<YamlNode> = [];
	private _folders: Array<YamlNode> = [];

	constructor(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());

		if (!this.isYamlActivate()) { return; }
		const document = vscode!.window!.activeTextEditor!.document;
		if (document) {
			this.loadYamlConfig(document);
		}
	}

	getTreeItem(element: YamlNode): vscode.TreeItem {
		if (element.contextValue.startsWith('step_model')){
			const num = this._hideUnModel ? 'on' : 'off';
			element.contextValue = `step_model:${num}`;
		}
		else if (element.contextValue.startsWith('model')) {
			const suffix = element.isModel() ? 'on' : 'off';
			const page = element.needPagination() ? 'page' : 'unpage';
			element.contextValue = `model:${suffix}:${page}`;
		}
		else if (element.contextValue.startsWith('property')) {
			const key = element.isKey() ? 'key' : 'unkey';
			const foreign = element.isForeignKey() ? 'foreignKey' : 'unForeignKey';
			element.contextValue = `property:${key}:${foreign}`;
		}
		else if (element.contextValue.startsWith('init_project')) {
			const suffix = element.isSwitchOn() ? 'on' : 'off';
			let value = element.contextValue;
			if (element.contextValue.endsWith(':on')) {
				value = element.contextValue.substring(0, element.contextValue.length - 3);
			} else if (element.contextValue.endsWith(':off')) {
				value = element.contextValue.substring(0, element.contextValue.length - 4);
			}
			element.contextValue = `${value}:${suffix}`;
		}
		return element;
	}

	getChildren(element?: YamlNode): Thenable<YamlNode[]> {
		if (element) {
			switch(element.nodeType) {
				case NodeType.StepApiPath:
					return Promise.resolve(this._apis);
				case NodeType.ApiPath:
					return this.getApiPathProperties(element);
				case NodeType.StepModel:
					let returnModels = this._models;
					if (this.shouldHideUnModel()) {
						returnModels = this._models.filter(node => {
							return node.isModel();
						});
					}
					return Promise.resolve(returnModels);
				case NodeType.Model:
					return Promise.resolve(this._modelProps[element.label]);
				case NodeType.Property:
					let props = [];
					if (element.isForeignKey()) {
						const node = new YamlNode(`Ref Model`, vscode.TreeItemCollapsibleState.None, NodeType.PropertyForeignModel);
						node.setDesc(element.foreignModel());
						node.setParent(element);
						props.push(node);
					}
					return Promise.resolve(props);
				case NodeType.StepProjectInit:
					return Promise.resolve(this.getProjectInitItems())
				case NodeType.StepGenerate:
					if (this._folders.length === 0) {
						this._folders.push(new YamlNode('Frame Path', vscode.TreeItemCollapsibleState.None, NodeType.FrameworkProjectFolder));
						this._folders.push(new YamlNode('Core Path', vscode.TreeItemCollapsibleState.None, NodeType.CoreProjectFolder));
					}
					return Promise.resolve(this._folders);
			}
		} else {
      return this.getTopItems();
		}
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
	}

	modelToggle(element?: YamlNode): void {
		this._hideUnModel = !this._hideUnModel;
		this.refresh();
	}

  shouldHideUnModel(): boolean {
		return this._hideUnModel;
	}

	coreCodeGenerate() {
		let corePath = '';
		for(let node of this._folders) {
			if (node.nodeType === NodeType.CoreProjectFolder) {
				corePath = node.folder;
			}
		}
		const text = vscode!.window!.activeTextEditor!.document!.getText();
		if (_.isEmpty(text)) {
			vscode.window.showErrorMessage('Yaml内容为空!');
			return;
		}
		const swaggerPath = path.resolve(corePath, 'swagger', 'auto.yaml');
		console.log(swaggerPath);
		fs.writeFileSync(swaggerPath, text);
		let dbname = '';
		let language = '';
		let userToken = false;
		let m2mToken = false;
		let swgdoc = false;
		for (let init of this._inits) {
			switch (init.nodeType) {
				case NodeType.InitProjectDatabase:
					dbname = init.description;
					break;
				case NodeType.InitProjectLanguage:
					language = init.description;
					break;
				case NodeType.InitProjectNeedJWT:
					userToken = init.isSwitchOn();
					break;
				case NodeType.InitProjectNeedSwgdoc:
					swgdoc = init.isSwitchOn();
					break;
				case NodeType.InitProjectNeedM2M:
					m2mToken = init.isSwitchOn();
					break;
			}
		}

		if (language === 'javascript') {
			const jsCommand = `cmd /C java -cp ../openapi-code-start/target/j-spring-openapi-generator-1.0.0.jar;modules/openapi-generator-cli/target/openapi-generator-cli.jar org.openapitools.codegen.OpenAPIGenerator generate -g j-nodejs -i ./swagger/auto.yaml -o ./out/j-nodejs --additional-properties swgdoc=${swgdoc},db=${dbname},m2mToken=${m2mToken},userToken=${userToken}`;
			console.log(jsCommand)
			exec(jsCommand, { cwd: corePath }, (err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(stderr);
				} else {
					vscode.window.showInformationMessage(stdout);
				}
			});
		} else if (language === 'spring') {
			const springCommand = `cmd /C java -cp ../openapi-code-start/target/j-spring-openapi-generator-1.0.0.jar;modules/openapi-generator-cli/target/openapi-generator-cli.jar org.openapitools.codegen.OpenAPIGenerator generate -g j-spring -i ./swagger/auto.yaml -o ./out/j-spring --additional-properties swgdoc=${swgdoc},db=${dbname},m2mToken=${m2mToken},userToken=${userToken}`;
			exec(springCommand, { cwd: corePath }, (err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(stderr);
				} else {
					vscode.window.showInformationMessage(stdout);
				}
			});
		}

		const postCommand = `cmd /C java -cp ../openapi-code-start/target/j-spring-openapi-generator-1.0.0.jar;modules/openapi-generator-cli/target/openapi-generator-cli.jar org.openapitools.codegen.OpenAPIGenerator generate -g postman -i ./swagger/auto.yaml -o ./out/postman --additional-properties swgdoc=${swgdoc},db=${dbname},m2mToken=${m2mToken},userToken=${userToken}`;
		console.log(postCommand)
		exec(postCommand, { cwd: corePath }, (err, stdout, stderr) => {
			if (err) {
				vscode.window.showErrorMessage(stderr);
			} else {
				vscode.window.showInformationMessage(stdout);
			}
		});

	}

	frameCodeGenerate() {
		if (!this.isYamlActivate()) {
			vscode.window.showErrorMessage('激活窗口的内容应当是Yaml格式!');
		}
		let framePath = '';
		for(let node of this._folders) {
			if (node.nodeType === NodeType.FrameworkProjectFolder) {
				framePath = node.folder;
			}
		}

		let projectName = undefined;
		// generate frame code
		if (!_.isEmpty(framePath)) {
			const rootPath = path.resolve(framePath);
			const codeEnvs = [];
			for (let init of this._inits) {
				switch (init.nodeType) {
					case NodeType.InitProjectDatabase:
						codeEnvs.push(init.description);
						break;
					case NodeType.InitProjectLanguage:
						codeEnvs.push(init.description);
						break;
					case NodeType.InitProjectName:
						projectName = init.description;
						break;
					case NodeType.InitProjectNeedAWS:
						if (init.isSwitchOn()) { codeEnvs.push('aws'); }
						break;
					case NodeType.InitProjectNeedCoverage:
						if (init.isSwitchOn()) { codeEnvs.push('cov'); }
						break;
					case NodeType.InitProjectNeedElasticSearch:
						if (init.isSwitchOn()) { codeEnvs.push('es'); }
						break;
					case NodeType.InitProjectNeedEmail:
						if (init.isSwitchOn()) { codeEnvs.push('email'); }
						break;
					case NodeType.InitProjectNeedEslint:
						if (init.isSwitchOn()) { codeEnvs.push('eslint'); }
						break;
					case NodeType.InitProjectNeedFile:
						if (init.isSwitchOn()) { codeEnvs.push('file'); }
						break;
					case NodeType.InitProjectNeedHeroku:
						if (init.isSwitchOn()) { codeEnvs.push('heroku'); }
						break;
					case NodeType.InitProjectNeedHttps:
						if (init.isSwitchOn()) { codeEnvs.push('https'); }
						break;
					case NodeType.InitProjectNeedJWT:
						if (init.isSwitchOn()) { codeEnvs.push('jwt'); }
						break;
					case NodeType.InitProjectNeedKafka:
						if (init.isSwitchOn()) { codeEnvs.push('kafka'); }
						break;
					case NodeType.InitProjectNeedKoa:
						if (init.isSwitchOn()) { codeEnvs.push('koa'); }
						break;
					case NodeType.InitProjectNeedM2M:
						if (init.isSwitchOn()) { codeEnvs.push('m2m'); }
						break;
					case NodeType.InitProjectNeedMockAPI:
						if (init.isSwitchOn()) { codeEnvs.push('mockapi'); }
						break;
					case NodeType.InitProjectNeedPagination:
						if (!init.isSwitchOn()) { codeEnvs.push('nopage'); }
						break;
					case NodeType.InitProjectNeedPassword:
						if (init.isSwitchOn()) { codeEnvs.push('pwd'); }
						break;
					case NodeType.InitProjectNeedPasswordSalt:
						if (init.isSwitchOn()) { codeEnvs.push('salt'); }
						break;
					case NodeType.InitProjectNeedSwgdoc:
						if (init.isSwitchOn()) { codeEnvs.push('swgdoc'); }
						break;
					case NodeType.InitProjectNeedTCJWT:
						if (init.isSwitchOn()) { codeEnvs.push('tcjwt'); }
						break;
					case NodeType.InitProjectNeedTest:
						if (init.isSwitchOn()) { codeEnvs.push('test'); }
						break;
					case NodeType.InitProjectNeedTslint:
						if (init.isSwitchOn()) { codeEnvs.push('tslint'); }
						break;
					case NodeType.InitProjectNeedTwilio:
						if (init.isSwitchOn()) { codeEnvs.push('twilio'); }
						break;
					case NodeType.InitProjectNeedXlsx:
						if (init.isSwitchOn()) { codeEnvs.push('xlsx'); }
						break;
				}
			}
			const strCommand = `cmd /C ts-node src/main.ts`;
			exec(strCommand, { cwd: rootPath, env: { 'CODE_ENV': codeEnvs.join(','), 'NAME_ENV': projectName } }, (err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(stderr);
				} else {
					vscode.window.showInformationMessage(stdout);
				}
			})
		} else {
			vscode.window.showWarningMessage('Frame的目录位置为空!');
		}
	}

  async fileSync() {
		const editor = vscode!.window!.activeTextEditor;
		if (!editor) { return; }

		const yamlContent = yaml.safeLoad(editor.document.getText());
		if (yamlContent) {
			_.each(yamlContent.paths, (value, path) => {
				_.each(value, (method, verb) => {
					const apiPath = this._apis.find(api => {
						return api.pathName === path && api.verbName === verb;
					});

					if (apiPath) {
						method['operationId'] = apiPath.operationId;
					}
				});
			});

			let def: any;
			for(def in yamlContent.definitions) {
				const nodeModel = this._models.find(model => {
					return model.label === String(def);
				});
				if (!nodeModel) { continue; }

				const yamlModel = yamlContent.definitions[def];
				yamlModel['x-table-model'] = nodeModel.isModel() ? true : undefined;
				yamlModel['x-search-page'] = nodeModel.isModel() && nodeModel.needPagination() ? true : undefined;

				const nodeProps: YamlNode[] = this._modelProps[String(def)];
				if (!nodeProps) { continue; }

				if (yamlModel.properties) {
					for(let prop in yamlModel.properties) {
						const nodeProp = nodeProps.find(node => {
							return node.label === String(prop);
						});
						if (!nodeProp) { continue; }
						const yamlProp = yamlModel.properties[prop];
						yamlProp['x-is-key'] = nodeProp.isKey() ? true : undefined;
						yamlProp['x-foreign-model'] = nodeProp.isForeignKey() ? nodeProp.foreignModel() : undefined;
					}
				}
				if (yamlModel.allOf) {
					for(let part of yamlModel.allOf) {
						if (part.properties) {
							for(let prop in part.properties) {
								const nodeProp = nodeProps.find(node => {
									return node.label === String(prop);
								});
								if (!nodeProp) { continue; }
								const yamlProp = part.properties[prop];
								yamlProp['x-is-key'] = nodeProp.isKey() ? true : undefined;
							}
						}
					}
				}
			}
		}
		await editor.edit(editBuilder => {
			const posStart = new vscode.Position(0, 0);
			const posEnd = new vscode.Position(editor.document.lineCount, 0);
			const wholeRange = new vscode.Range(posStart, posEnd);
			console.log('Start file sync');
			const content = yaml.safeDump(yamlContent, { skipInvalid: true });
			editBuilder.replace(wholeRange, content);
			console.log('End file sync');
		})
	}

	private getApiPathProperties(element: YamlNode): Thenable<YamlNode[]>{
		const nodes : YamlNode[] = [];

		const node = new YamlNode('operationId', vscode.TreeItemCollapsibleState.None, NodeType.ApiPathProperty );
		node.setParent(element);
		node.setDesc(element.operationId);
		node.executer = new executer.ApiPathOperationIdSettingExecuter();
		nodes.push(node);

		return Promise.resolve(nodes);
	}

  private getTopItems(): Thenable<YamlNode[]> {
    const tops = [];
    tops.push(new YamlNode('1. API元数据设定', vscode.TreeItemCollapsibleState.Collapsed, NodeType.StepApiPath));
    tops.push(new YamlNode('2. Model元数据设定', vscode.TreeItemCollapsibleState.Collapsed, NodeType.StepModel));
    tops.push(new YamlNode('3. 项目环境参数设定', vscode.TreeItemCollapsibleState.Collapsed, NodeType.StepProjectInit));
    tops.push(new YamlNode('4. 项目框架代码生成', vscode.TreeItemCollapsibleState.Collapsed, NodeType.StepGenerate));

    return Promise.resolve(tops);
	}

	private getProjectInitItems(): YamlNode[] {
		if (this._inits.length === 0) {
			this._inits.push(new YamlNode('project name', vscode.TreeItemCollapsibleState.None, 							NodeType.InitProjectName));
			this._inits.push(new YamlNode('language', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectLanguage));
			this._inits.push(new YamlNode('database', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectDatabase));
			this._inits.push(new YamlNode('need mock api', vscode.TreeItemCollapsibleState.None, 							NodeType.InitProjectNeedMockAPI));
			this._inits.push(new YamlNode('need pagination', vscode.TreeItemCollapsibleState.None,  					NodeType.InitProjectNeedPagination));
			this._inits.push(new YamlNode('need email', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedEmail));
			this._inits.push(new YamlNode('need xlsx', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedXlsx));
			this._inits.push(new YamlNode('need file', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedFile));
			this._inits.push(new YamlNode('need https', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedHttps));
			this._inits.push(new YamlNode('need elastic search', vscode.TreeItemCollapsibleState.None, 				NodeType.InitProjectNeedElasticSearch));
			this._inits.push(new YamlNode('need kafka', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedKafka));
			this._inits.push(new YamlNode('need twilio', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedTwilio));
			this._inits.push(new YamlNode('need aws', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedAWS));
			this._inits.push(new YamlNode('need password salt', vscode.TreeItemCollapsibleState.None, 				NodeType.InitProjectNeedPasswordSalt));
			this._inits.push(new YamlNode('need pwd', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedPassword));
			this._inits.push(new YamlNode('need machine token', vscode.TreeItemCollapsibleState.None, 				NodeType.InitProjectNeedM2M));
			this._inits.push(new YamlNode('need tc jwt', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedTCJWT));
			this._inits.push(new YamlNode('need jwt', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedJWT));
			this._inits.push(new YamlNode('need koa', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedKoa));
			this._inits.push(new YamlNode('need swgdoc', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedSwgdoc));
			this._inits.push(new YamlNode('need heroku', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedHeroku));
			this._inits.push(new YamlNode('need tslint', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedTslint));
			this._inits.push(new YamlNode('need eslint', vscode.TreeItemCollapsibleState.None, 								NodeType.InitProjectNeedEslint));
			this._inits.push(new YamlNode('need coverage', vscode.TreeItemCollapsibleState.None, 							NodeType.InitProjectNeedCoverage));
			this._inits.push(new YamlNode('need test', vscode.TreeItemCollapsibleState.None, 									NodeType.InitProjectNeedTest));
		}
		return this._inits;
	}

  private parseYaml(yamlContent: any) {
		this._apis = [];
		_.each(yamlContent.paths, (value, path) => {
			_.each(value, (method, verb) => {
				const yamlNode = new YamlNode(`${verb} ${path}`, vscode.TreeItemCollapsibleState.Collapsed, NodeType.ApiPath);
				yamlNode.pathName = path;
				yamlNode.verbName = verb;
				yamlNode.operationId = method.operationId;
				if (!method.operationId) {
					const verbName = verb.toLowerCase().trim();
					if ( verbName === 'post') {
						yamlNode.operationId = 'create';
					} else if ( verbName === 'put') {
						yamlNode.operationId = 'update';
					} else if ( verbName === 'patch') {
						yamlNode.operationId = 'partiallyUpdate';
					} else if ( verbName === 'get') {
						if (path.indexOf('/:') > 0 || path.indexOf('/{') > 0) {
							yamlNode.operationId = 'get';
						} else {
							yamlNode.operationId = 'search';
						}
					}
				}
				this._apis.push(yamlNode);
			});
		});

		this._apis = this._apis.sort((a, b) => {
			if ( a.pathName < b.pathName ) { return -1; };
			if ( a.pathName > b.pathName ) { return 1; };
			if ( a.verbName < b.verbName ) { return -1; };
			if ( a.verbName > b.verbName ) { return 1; };
			return 0;
		});
		this._models = [];
		this._modelProps = {};
		for(let def in yamlContent.definitions) {
			const node = new YamlNode(String(def), vscode.TreeItemCollapsibleState.Collapsed, NodeType.Model);
			node.autoJudgeModel();
			this._models.push(node);

			const yamlModel = yamlContent.definitions[def];
			const props = [];
			for(let prop in yamlModel.properties) {
				const nodeProp = new YamlNode(String(prop), vscode.TreeItemCollapsibleState.Collapsed, NodeType.Property);
				nodeProp.autoJudgeProperty();
				props.push(nodeProp);
			}
			if (yamlModel.allOf) {
				for(let part of yamlModel.allOf) {
					if (part.properties) {
						for(let prop in part.properties) {
							const nodeProp = new YamlNode(String(prop), vscode.TreeItemCollapsibleState.Collapsed, NodeType.Property);
							nodeProp.autoJudgeProperty();
							props.push(nodeProp);
						}
					}
				}
			}
			this._modelProps[def] = props;
		}
		this._models = this._models.sort((a, b) => {
			if ( a.label < b.label ) { return -1; };
			if ( a.label > b.label ) { return 1; };
			return 0;
		});
  }

	private isYamlActivate(): boolean {
		if (!vscode.window.activeTextEditor) { return false; }
		if (vscode.window.activeTextEditor.document!.uri!.scheme !== 'file') { return false; }
		const document = vscode.window.activeTextEditor.document;
		const enabled = document.languageId === 'yaml' || document.languageId === 'yml';
		return enabled;
	}

	private cleanYaml(): void {
		this._models = [];
		this._modelProps = {};
	}

  private onActiveEditorChanged(): void {
		if (!this.isYamlActivate()) { return; }
		const document = vscode!.window!.activeTextEditor!.document;
		this.loadYamlConfig(document)
		this.refresh();
	}

	private loadYamlConfig(document: vscode.TextDocument): void {
		if (!document) { return; }

		this.cleanYaml();
		const yamlContent = yaml.safeLoad(document.getText());
		if (yamlContent) {
			this.parseYaml(yamlContent);
		}
	}

	async changeForeignModel(node: YamlNode): Promise<void> {
		const value = await vscode.window.showInputBox({ placeHolder: 'Enter the reference model name' })
		if (!_.isNil(value)) {
			node.changeForeignModel(value);
			this.refresh();
		}
	}

	async changeAttribute(node: YamlNode): Promise<void> {
		const value = await vscode.window.showInputBox({ placeHolder: 'Enter the attribute value' })
		if (!_.isNil(value)) {
			node.setDesc(value);
			this.refresh();
		}
	}

	async selectDatabase(node: YamlNode): Promise<void> {
		const dbs = ['jsondb', 'neo4j', 'mongo', 'dynamo', 'mysql', 'mariadb', 'sqlite', 'postgres', 'mssql'];
		const selectDb = await vscode.window.showQuickPick(dbs, {canPickMany: false});
		node.setDesc(selectDb);
		this.refresh();
	}

	async selectLanguage(node: YamlNode): Promise<void> {
		const dbs = ['typescript', 'javascript', 'spring'];
		const selectDb = await vscode.window.showQuickPick(dbs, {canPickMany: false});
		node.setDesc(selectDb);
		this.refresh();
	}

	async selectFolder(node: YamlNode): Promise<void> {
	  const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
		if (!_.isNil(uris) && uris.length > 0) {
			node.setFolder(uris[0].fsPath);
			this.refresh();
		}
	}

	private isSamePath(path1: string, path2: string): boolean {
		const path1s = path1.split('/');
		const path2s = path2.split('/');

		if (path1s.length !== path2s.length) { return false; }
		for(let i=0; i< path1s.length; i++) {
			if (path1s[i].startsWith(':') || path1s[i].startsWith('{')) { continue; }
			if (path1s[i].toLowerCase() !== path2s[i].toLowerCase()) { return false; }
		}
		return true;
	}

	async loadOperationIdFromRoute(): Promise<void> {
		const uris = await vscode.window.showOpenDialog({ canSelectFolders: false, canSelectFiles: true });
		if (!_.isNil(uris) && uris.length > 0) {
			const routes = require(uris[0].fsPath);
			if (routes) {
				_.each(routes, (value, pathName) => {
					_.each(value, (method, verbName) => {
						const api = this._apis.find(item => {
							return this.isSamePath(item.pathName, pathName) && item.verbName === verbName;
						});
						if (api) {
							_.each(method, (propValue, propName) => {
								if ( _.isString(propValue)
									&& !propName.toLowerCase().startsWith('auth')
									&& !propName.toLowerCase().startsWith('controller')
									&& !propValue.toLowerCase().startsWith('jwt')
									&& propValue.indexOf('.') < 0
									&& propValue.indexOf('/') < 0
									&& !propValue.toLowerCase().endsWith('controller')) {
									api.operationId = propValue;
								}
							});
						}
					});
				});
				this.refresh();
			}
		}
	}
}
