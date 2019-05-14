import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { exec } from 'child_process';

enum NodeType {
	StepApiPath,
	StepModel,
	StepProjectInit,
	StepGenerate,
	Model,
	Property,
	PropertyForeignModel,
	InitProjectName,
	InitProjectLanguage,
	InitProjectDatabase,
	InitProjectNeedMockAPI,
	InitProjectNeedPagination,
	InitProjectNeedEmail,
	InitProjectNeedXlsx,
	InitProjectNeedFile,
	InitProjectNeedHttps,
	InitProjectNeedElasticSearch,
	InitProjectNeedKafka,
	InitProjectNeedTwilio,
	InitProjectNeedAWS,
	InitProjectNeedPasswordSalt,
	InitProjectNeedPassword,
	InitProjectNeedM2M,
	InitProjectNeedTCJWT,
	InitProjectNeedJWT,
	InitProjectNeedKoa,
	InitProjectNeedSwgdoc,
	InitProjectNeedHeroku,
	InitProjectNeedTslint,
	InitProjectNeedEslint,
	InitProjectNeedCoverage,
	InitProjectNeedTest,
	FrameworkProjectFolder,
	CoreProjectFolder
};

export class ProjectInitProvider implements vscode.TreeDataProvider<YamlNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<YamlNode | undefined> = new vscode.EventEmitter<YamlNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<YamlNode | undefined> = this._onDidChangeTreeData.event;
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
				case NodeType.StepModel:
					let rets = this._models;
					if (this.shouldHideUnModel()) {
						rets = this._models.filter(node => {
							return node.isModel();
						});
					}
					return Promise.resolve(rets);
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
}

export class YamlNode extends vscode.TreeItem {
	private _isRealModel: boolean = true;
	private _isPagination: boolean = false;
	private _isKey: boolean = false;
	private _isForeignKey: boolean = false;
	private _foreignModel: string | undefined;
	private _description: string = '';
	private _parentNode: YamlNode | undefined;
	private _isSwitchOn: boolean = false;
	private _folderPath: string = '';

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly nodeType: NodeType,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		switch(nodeType) {
			case NodeType.StepModel:
				this.contextValue = 'step_model';
				break;
			case NodeType.StepApiPath:
				this.contextValue = 'step_api_path';
				break;
			case NodeType.StepProjectInit:
				this.contextValue = 'step_project_init';
				break;
			case NodeType.StepGenerate:
				this.contextValue = 'step_generate';
				break;
			case NodeType.Model:
				this.contextValue = 'model';
				break;
			case NodeType.Property:
				this.contextValue = 'property';
				break;
			case NodeType.PropertyForeignModel:
				this.contextValue = 'prop:foreignModel';
				break;
			case NodeType.InitProjectName:
				this.contextValue = 'init_project_attr:name';
				break;
			case NodeType.InitProjectLanguage:
					this.contextValue = 'init_project_attr:language';
					break;
			case NodeType.InitProjectDatabase:
					this.contextValue = 'init_project_attr:database';
					break;
			case NodeType.InitProjectNeedMockAPI:
					this.contextValue = 'init_project:mockapi';
					break;
			case NodeType.InitProjectNeedPagination:
					this.contextValue = 'init_project:pagination';
					break;
			case NodeType.InitProjectNeedEmail:
					this.contextValue = 'init_project:email';
					break;
			case NodeType.InitProjectNeedXlsx:
					this.contextValue = 'init_project:xlsx';
					break;
			case NodeType.InitProjectNeedFile:
					this.contextValue = 'init_project:fileUpload';
					break;
			case NodeType.InitProjectNeedHttps:
					this.contextValue = 'init_project:https';
					break;
			case NodeType.InitProjectNeedElasticSearch:
					this.contextValue = 'init_project:elasticSearch';
					break;
			case NodeType.InitProjectNeedKafka:
					this.contextValue = 'init_project:kafka';
					break;
			case NodeType.InitProjectNeedTwilio:
					this.contextValue = 'init_project:twilio';
					break;
			case NodeType.InitProjectNeedAWS:
					this.contextValue = 'init_project:aws';
					break;
			case NodeType.InitProjectNeedPasswordSalt:
					this.contextValue = 'init_project:pwdSalt';
					break;
			case NodeType.InitProjectNeedPassword:
					this.contextValue = 'init_project:password';
					break;
			case NodeType.InitProjectNeedM2M:
					this.contextValue = 'init_project:m2m';
					break;
			case NodeType.InitProjectNeedTCJWT:
					this.contextValue = 'init_project:tcjwt';
					break;
			case NodeType.InitProjectNeedJWT:
					this.contextValue = 'init_project:jwt';
					break;
			case NodeType.InitProjectNeedKoa:
					this.contextValue = 'init_project:koa';
					break;
			case NodeType.InitProjectNeedSwgdoc:
					this.contextValue = 'init_project:swgdoc';
					break;
			case NodeType.InitProjectNeedHeroku:
					this.contextValue = 'init_project:heroku';
					break;
			case NodeType.InitProjectNeedTslint:
					this.contextValue = 'init_project:tslint';
					break;
			case NodeType.InitProjectNeedEslint:
					this.contextValue = 'init_project:eslint';
					break;
			case NodeType.InitProjectNeedCoverage:
					this.contextValue = 'init_project:coverage';
					break;
			case NodeType.InitProjectNeedTest:
					this.contextValue = 'init_project:test';
					break;
			case NodeType.FrameworkProjectFolder:
					this.contextValue = 'folder:framework';
					break;
			case NodeType.CoreProjectFolder:
					this.contextValue = 'folder:core';
					break;
		}
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return this._description;
	}

	autoJudgeModel(): void {
		if (this.label === 'Id' || this.label === 'Error' || this.label === 'Record' || this.label.endsWith('Data')) {
			this._isRealModel = false;
		}
	}

	autoJudgeProperty(): void {
		if (this.label.toLowerCase() === 'id') {
			this._isKey = true;
		} else if (this.label.endsWith('Id')) {
			this._isForeignKey = true;
			const name = this.label.substring(0, this.label.length - 2);
			this._foreignModel = _.upperFirst(name);
		}
	}

	modelToggle(): void {
		this._isRealModel = !this._isRealModel;
	}

	isModel(): boolean {
		return this._isRealModel;
	}

	needPagination(): boolean {
		return this._isPagination;
	}

	paginationToggle(): void {
		this._isPagination = !this._isPagination;
	}

	isKey() : boolean {
		return this._isKey;
	}

	keyToggle(): void {
		this._isKey = !this._isKey;
	}

	isForeignKey(): boolean {
		return this._isForeignKey;
	}

	foreignKeyToggle(): void {
		this._isForeignKey = !this._isForeignKey;
	}

	foreignModel(): string | undefined{
		return this._foreignModel;
	}

	setDesc(desc: string | undefined): void {
		this._description = desc ? desc : '';
	}

	setParent(parent: YamlNode): void {
		this._parentNode = parent;
	}

	setForeignModel(modelName: string): void {
		this._foreignModel = modelName;
	}

	changeForeignModel(modelName: string): void {
		this._description = modelName;
		if (this._parentNode) {
			this._parentNode.setForeignModel(modelName);
		}
	}

	isSwitchOn(): boolean {
		return this._isSwitchOn;
	}

	switchToggle(): void {
		this._isSwitchOn = !this._isSwitchOn;
	}

	setFolder(folder: string): void {
		this._folderPath = folder;
		this.setDesc(folder);
	}

	get folder(): string {
		return this._folderPath;
	}

	iconPath = {
		light: path.join(__filename, '../../../../', 'media/light/step.svg'),
		dark: path.join(__filename, '../../../../', 'media/light/step.svg')
	};

	contextValue = 'yamlnode';

}
