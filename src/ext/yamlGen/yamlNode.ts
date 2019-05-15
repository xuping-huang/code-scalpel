import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as path from 'path';
import { NodeExecuter } from './executer';
import { ProjectInitProvider } from './yamlExplorer';

export enum NodeType {
	StepApiPath,
	StepModel,
	StepProjectInit,
  StepGenerate,
  ApiPath,
  ApiPathProperty,
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
  private _pathName: string = '';
  private _verbName: string = '';
  private _operationId: string = '';
  private _executer: NodeExecuter | undefined;

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
			case NodeType.ApiPath:
				this.contextValue = 'api_paths';
				break;
			case NodeType.ApiPathProperty:
				this.contextValue = 'api_path_property';
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

  async runCommand(provider: ProjectInitProvider): Promise<void> {
    if (this.executer) {
      await this.executer.run(this);
      provider.refresh();
    }
  }

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
    if (this.nodeType === NodeType.ApiPathProperty && !_.isNil(this.parent)) {
      return this.parent.operationId;
    }
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

  get parent(): YamlNode | undefined{
    return this._parentNode;
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

  get pathName(): string {
    return this._pathName;
  }

  set pathName(value:string) {
    this._pathName = value;
  }

  get verbName(): string {
    return this._verbName;
  }

  set verbName(value:string) {
    this._verbName = value;
  }

  get operationId(): string {
    return this._operationId;
  }

  set operationId(value:string) {
    this._operationId = value;
  }

  get executer(): NodeExecuter | undefined {
    return this._executer;
  }

  set executer(value:NodeExecuter | undefined) {
    this._executer = value;
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
