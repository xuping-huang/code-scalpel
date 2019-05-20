import * as vscode from 'vscode';
import { CodeNode, NodeName } from './CodeNode';
import { NodeType } from './NodeType';
import * as pasteProcessor from './pasteUtils/pasteProcessor';
import { PasteNode } from './pasteUtils/PasteNode';
import { TableSqlParser } from './pasteUtils/parser/TableSqlParser';
import { SequelizeModelConvertor } from './pasteUtils/convertor/SequelizeModelConvertor';
import { SnakeStringParser } from './pasteUtils/parser/SnakeStringParser';
import { CamelCaseConvertor } from './pasteUtils/convertor/CamelCaseConvertor';
import { JsonParser } from './pasteUtils/parser/JsonParser';
import { PostmanJsonConvertor } from './pasteUtils/convertor/PostmanJsonConvertor';
import { CodeJsonConvertor } from './pasteUtils/convertor/CodeJsonConvertor';
import { JoiSchemaParser } from './pasteUtils/parser/JoiSchemaParser';
import { JoiSchema2TestConvertor } from './pasteUtils/convertor/JoiSchem2TestConvertor';
import { PostmanSchemaParser } from './pasteUtils/parser/PostmanSchemaParser';
import { E2eTestConvertor } from './pasteUtils/convertor/E2eTestConvertor';
import { UnitTestConvertor } from './pasteUtils/convertor/UnitTestConvertor';
import { SwaggerModelParser } from './pasteUtils/parser/SwaggerModelParser';
import { PasteConfigNode } from './pasteUtils/PasteConfigNode';
import * as executer from './executer';
import { SwaggerModel2JsonDataConverter } from './pasteUtils/convertor/SwaggerModel2JsonDataConverter';

export class CodeUtilProvider implements vscode.TreeDataProvider<CodeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<CodeNode | undefined> = new vscode.EventEmitter<CodeNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<CodeNode | undefined> = this._onDidChangeTreeData.event;
  private _pasteItems: CodeNode[] = [];
  private _tops: CodeNode[] = [];

  constructor(context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CodeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element.contextValue.startsWith(NodeName.PasteUtilFolder)){
      element.contextValue = `${NodeName.PasteUtilFolder}:${this.onOffSuffix(element)}`;
    }
    else if (element.contextValue.startsWith(NodeName.PasteUtilItem)) {
      element.contextValue = `${NodeName.PasteUtilItem}:${this.onOffSuffix(element)}`;
    }
    else if (element.contextValue.startsWith(NodeName.OtherUtilFolder)) {
      element.contextValue = `${NodeName.OtherUtilFolder}:${this.onOffSuffix(element)}`;
    }
    return element;
  }

  getChildren(element?: CodeNode | undefined): vscode.ProviderResult<CodeNode[]> {
    if (element) {
      switch(element.nodeType) {
        case NodeType.PasteUtilFolder:
          return this.getPasteUtils(element);
          break;
        case NodeType.PasteUtilItem:
          return this.getPasteConfigs(<PasteNode> element);
          break;
      }
    } else {
      return this.getTopItems();
    }
    return Promise.resolve([]);
  }

  getTopItems(): Promise<CodeNode[]> {
    if (this._tops.length > 0 ) { return Promise.resolve(this._tops); }
    this._tops.push(new CodeNode('Paste Pre Processor', '粘贴前对剪贴板中的代码内容进行模式识别，匹配后自动转换处理', vscode.TreeItemCollapsibleState.Expanded, NodeType.PasteUtilFolder));
    this._tops.push(new CodeNode('Others', '其它', vscode.TreeItemCollapsibleState.Collapsed, NodeType.OtherUtilFolder));

    return Promise.resolve(this._tops);
  }

  getPasteUtils(parent: CodeNode): Promise<CodeNode[]> {
    if (this._pasteItems.length > 0) { return Promise.resolve(this._pasteItems); }
    this._pasteItems.push(new PasteNode('Create table Sql >> Sequelize model', '建表脚本转换为Sequelize模型', new TableSqlParser(), new SequelizeModelConvertor(), parent));
    this._pasteItems.push(new PasteNode('Snake >> camelCase', '下划线转换为小写开头的驼峰格式', new SnakeStringParser(), new CamelCaseConvertor(false), parent));
    this._pasteItems.push(new PasteNode('Snake >> CamelCase', '下划线转换为大写开头的驼峰格式', new SnakeStringParser(), new CamelCaseConvertor(true), parent));
    this._pasteItems.push(new PasteNode('Json >> Postman Standard', '将符合Json格式的代码转换为Postman规范的风格', new JsonParser(), new PostmanJsonConvertor(), parent));
    this._pasteItems.push(new PasteNode('Json >> Code Standard', '将符合Json格式的代码转换为符合代码规范的风格', new JsonParser(), new CodeJsonConvertor(), parent));
    this._pasteItems.push(new PasteNode('Postman > E2E Test', '将Postman的测试用例定义转换为e2e单元测试代码', new PostmanSchemaParser(), new E2eTestConvertor(), parent));
    this._pasteItems.push(new PasteNode('Postman > Unit Test', '将Postman的测试用例定义转换为Service单元测试代码', new PostmanSchemaParser(), new UnitTestConvertor(), parent));
    this._pasteItems.push(new PasteNode('Joi Schema >> Test', '将Joi的schema定义转换为单元测试的参数定义风格', new JoiSchemaParser(), new JoiSchema2TestConvertor(), parent));
    this._pasteItems.push(new PasteNode('Swagger Model >> Json Data', '将Swagger的Model定义转换为JSON數據', new SwaggerModelParser(), new SwaggerModel2JsonDataConverter(), parent));
    return Promise.resolve(this._pasteItems);
  }

  getPasteConfigs(parent: PasteNode): Promise<PasteConfigNode[]> {
    const nodes : PasteConfigNode[] = [];

		const node = new PasteConfigNode(parent);
		node.executer = new executer.ConfigPathSelectExecuter();
		nodes.push(node);

		return Promise.resolve(nodes);
  }

  onOffSuffix(element: CodeNode): string {
    return element.isSwitchOn() ? 'on' : 'off';
  }

  async pastePreProcess(): Promise<string|undefined> {
    const found = this._pasteItems.filter(item => {
      return item.isActive();
    });
    if (found && found.length > 0) {
      return await pasteProcessor.preHandle(found);
    }
    return Promise.resolve(undefined);
  }

  async pastePostProcess(content: string|undefined): Promise<void> {
    if (content) {
      await pasteProcessor.postHandle(content);
    }
    return Promise.resolve();
  }

}
