"use strict";
import * as vscode from "vscode";
import { ProjectInitProvider } from "./yamlExplorer";
import { YamlNode } from "./yamlNode";

export function registerYamlCodeGenerate(context: vscode.ExtensionContext) {
  const projectInitProvider = new ProjectInitProvider(context);
  vscode.window.registerTreeDataProvider("projectInit", projectInitProvider);
  console.log('projectInit provider register');
  vscode.commands.registerCommand("projectInit.refresh", () =>
    projectInitProvider.refresh()
  );
  vscode.commands.registerCommand(
    "projectInit.modelToggleOff",
    (node: YamlNode) => projectInitProvider.modelToggle(node)
  );
  vscode.commands.registerCommand(
    "projectInit.modelToggleOn",
    (node: YamlNode) => projectInitProvider.modelToggle(node)
  );
  vscode.commands.registerCommand("projectInit.modelOn", (node: YamlNode) => {
    node.modelToggle();
    projectInitProvider.refresh();
  });
  vscode.commands.registerCommand("projectInit.modelOff", (node: YamlNode) => {
    node.modelToggle();
    projectInitProvider.refresh();
  });
  vscode.commands.registerCommand(
    "projectInit.modelPaginationOn",
    (node: YamlNode) => {
      node.paginationToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.modelPaginationOff",
    (node: YamlNode) => {
      node.paginationToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.propertyKeyOn",
    (node: YamlNode) => {
      node.keyToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.propertyKeyOff",
    (node: YamlNode) => {
      node.keyToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.propertyForeignKeyOn",
    (node: YamlNode) => {
      node.foreignKeyToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.propertyForeignKeyOff",
    (node: YamlNode) => {
      node.foreignKeyToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.foreignModelChange",
    (node: YamlNode) => {
      projectInitProvider.changeForeignModel(node);
    }
  );
  vscode.commands.registerCommand(
    "projectInit.initProjectAttrSet",
    (node: YamlNode) => {
      projectInitProvider.changeAttribute(node);
    }
  );
  vscode.commands.registerCommand(
    "projectInit.initProjectSwitchOn",
    (node: YamlNode) => {
      node.switchToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.initProjectSwitchOff",
    (node: YamlNode) => {
      node.switchToggle();
      projectInitProvider.refresh();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.initProjectDatabase",
    (node: YamlNode) => {
      projectInitProvider.selectDatabase(node);
    }
  );
  vscode.commands.registerCommand(
    "projectInit.initProjectLanguage",
    (node: YamlNode) => {
      projectInitProvider.selectLanguage(node);
    }
  );
  vscode.commands.registerCommand(
    "projectInit.selectFolder",
    (node: YamlNode) => {
      projectInitProvider.selectFolder(node);
    }
  );
  vscode.commands.registerCommand(
    "projectInit.frameGenerate",
    (node: YamlNode) => {
      projectInitProvider.frameCodeGenerate();
    }
  );
  vscode.commands.registerCommand(
    "projectInit.coreGenerate",
    (node: YamlNode) => {
      projectInitProvider.coreCodeGenerate();
    }
  );
  vscode.commands.registerCommand("apiPath.property.edit", (node: YamlNode) => {
    node.runCommand(projectInitProvider);
  });
  vscode.commands.registerCommand("apiPath.route.select", (node: YamlNode) => {
    projectInitProvider.loadOperationIdFromRoute();
  });

  vscode.commands.registerCommand("projectInit.fileSync", () =>
    projectInitProvider.fileSync()
  );
}
