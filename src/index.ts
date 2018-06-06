import {TreeNode, TreeNodeSerialized} from './tree'
import {Forest} from './forest'
import {getAbsoluteSelection, getRelativeSelection, select} from './selection'
import {deserialize, WhiskeyWigNode, WhiskeyWigNodeValue} from './ww-nodes'
import {mergeSequentialNodes} from './utils'
import {getWwForest, stripSyntaxHighlightTags, wrapInTreeNodes} from './ast'

function isNodeValueTextNode(treeNode: TreeNode<Node>): treeNode is TreeNode<Text> {
  return treeNode.getValue() instanceof Text
}

function mergeSequentialTextNodes(forest: Forest<Node, TreeNode<Node>>): void {
  mergeSequentialNodes(forest, isNodeValueTextNode, (...treeNodes) => {
    return document.createTextNode(treeNodes.reduce((acc, curr) => acc + curr.getValue().data, ''))
  })
}

export default class WhiskeyWig {

  private isInterpolationValid: (str: string) => ((str: string) => string) | null = () => null
  private getError: (userString: string) => string = (userString: string) => `"${userString.trim()}" is not a valid variable.`
  private model!: Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>
  private onUpdateFunctions: ((model: Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>) => any)[] = []

  constructor(private editorDomElement: HTMLElement) {
  }

  public initialize(): this {
    this.editorDomElement.contentEditable = 'true'
    this.editorDomElement.style.whiteSpace = 'pre-wrap'
    this.editorDomElement.addEventListener('input', () => this.updateEditor())
    this.editorDomElement.addEventListener('paste', () => this.updateEditor())
    this.updateEditor({doNotEmitEvent: true})
    return this
  }

  public setErrorFn(getError: (userString: string) => string): this {
    this.getError = getError
    return this
  }

  public setValidVariableNames(...varNames: string[]): this {
    this.isInterpolationValid = (str: string) => {
      return varNames.findIndex(varName => {
        return varName.trim().toLocaleLowerCase() == str.trim().toLocaleLowerCase()
      }) > -1 ? null : this.getError
    }
    return this
  }

  public registerOnUpdate(onUpdate: (model: Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>) => any): this {
    this.onUpdateFunctions.push(onUpdate)
    return this
  }

  public removeOnUpdate(onUpdate: (model: Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>) => any): this {
    const index = this.onUpdateFunctions.indexOf(onUpdate)
    if (index == -1) return this
    this.onUpdateFunctions.splice(index, 1)
    return this
  }

  public loadSerializedModel(serializedModel: TreeNodeSerialized<WhiskeyWigNodeValue>[]): this {
    const model = Forest.deserialize(serializedModel, deserialize)
    this.loadModel(model)
    return this
  }

  public getModel() {
    return this.model
  }

  private loadModel(model: Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>): this {
    this.model = model
    const html = this.render()
    html.forEach(node => this.editorDomElement.appendChild(node))
    return this
  }

  public updateEditor({doNotEmitEvent = false} = {}) {
    const wrapped = wrapInTreeNodes(this.editorDomElement)
    const absoluteSelection = getAbsoluteSelection(wrapped, window.getSelection())
    stripSyntaxHighlightTags(wrapped)
    mergeSequentialTextNodes(wrapped)

    this.model = getWwForest(wrapped, this.isInterpolationValid)

    while (this.editorDomElement.firstChild != null) {
      this.editorDomElement.removeChild(this.editorDomElement.firstChild)
    }

    const html = this.render()
    html.forEach(node => this.editorDomElement.appendChild(node))

    if (absoluteSelection == null) {
      return
    }

    const relativeSelection = getRelativeSelection(this.editorDomElement, absoluteSelection)
    if (relativeSelection == null) {
      return
    }

    select(relativeSelection)

    if (!doNotEmitEvent) {
      this.onUpdateFunctions.forEach(fn => fn(this.model))
    }
  }

  private render(): Node[] {
    return this.model.getRoots().map(root => root.render())
  }

}

export * from './ww-nodes'
