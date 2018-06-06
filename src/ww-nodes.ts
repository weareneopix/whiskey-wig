import {TreeNode, TreeNodeSerialized} from './tree'

export const enum WhiskeyWigNodeValueType {
  TEXT,
  HTML_ELEMENT,
  INTERPOLATION,
  INTERPOLATION_ERROR,
}

export interface WhiskeyWigNodeTextValue {
  type: WhiskeyWigNodeValueType.TEXT
  content: string
}

export interface WhiskeyWigNodeElementValue {
  type: WhiskeyWigNodeValueType.HTML_ELEMENT
  tagName: string
  attributes: [string, any][]
}

export interface WhiskeyWigNodeInterpolationValue {
  type: WhiskeyWigNodeValueType.INTERPOLATION
  value: string
}

export interface WhiskeyWigNodeInterpolationErrorValue {
  type: WhiskeyWigNodeValueType.INTERPOLATION_ERROR
  value: string
  error: string
}

export type WhiskeyWigNodeValue =
  WhiskeyWigNodeTextValue |
  WhiskeyWigNodeElementValue |
  WhiskeyWigNodeInterpolationValue |
  WhiskeyWigNodeInterpolationErrorValue

export abstract class WhiskeyWigNode<V extends WhiskeyWigNodeValue> extends TreeNode<WhiskeyWigNodeValue, V> {
  public abstract render(): Node
}

export class WhiskeyWigTextNode extends WhiskeyWigNode<WhiskeyWigNodeTextValue> {
  constructor(content: string) {
    super({type: WhiskeyWigNodeValueType.TEXT, content})
  }

  public render(): Node {
    return document.createTextNode(this.getValue().content)
  }
}

export class WhiskeyWigHtmlNode extends WhiskeyWigNode<WhiskeyWigNodeElementValue> {
  constructor(tagName: string, attributes: [string, any][], children?: WhiskeyWigNode<WhiskeyWigNodeValue>[]) {
    super({type: WhiskeyWigNodeValueType.HTML_ELEMENT, tagName, attributes}, children)
  }

  public render(): Node {
    const {tagName, attributes} = this.getValue()
    const domNode = document.createElement(tagName)
    attributes.forEach(([key, value]) => {
      domNode.setAttribute(key, value)
    })
    this.getChildren().forEach(child => {
      domNode.appendChild(child.render())
    })
    return domNode
  }
}

export class WhiskeyWigInterpolationNode extends WhiskeyWigNode<WhiskeyWigNodeInterpolationValue> {
  constructor(value: string) {
    super({type: WhiskeyWigNodeValueType.INTERPOLATION, value})
  }

  public render(): Node {
    const span = document.createElement('span')
    span.classList.add('ww', 'ww-interpolation')
    span.appendChild(document.createTextNode('{{' + this.getValue().value + '}}'))
    return span
  }
}

export class WhiskeyWigInterpolationErrorNode extends WhiskeyWigNode<WhiskeyWigNodeInterpolationErrorValue> {
  constructor(value: string, error: string) {
    super({type: WhiskeyWigNodeValueType.INTERPOLATION_ERROR, value, error})
  }

  public render(): Node {
    const span = document.createElement('span')
    span.classList.add('ww', 'ww-interpolation', 'ww-invalid')
    span.setAttribute('data-error', this.getValue().error)
    span.appendChild(document.createTextNode('{{' + this.getValue().value + '}}'))
    return span
  }
}

export function deserialize({v, c}: TreeNodeSerialized<WhiskeyWigNodeValue>): WhiskeyWigNode<WhiskeyWigNodeValue> {
  switch (v.type) {
    case WhiskeyWigNodeValueType.TEXT:
      return new WhiskeyWigTextNode(v.content)
    case WhiskeyWigNodeValueType.HTML_ELEMENT:
      return new WhiskeyWigHtmlNode(v.tagName, v.attributes, c.map(deserialize))
    case WhiskeyWigNodeValueType.INTERPOLATION:
      return new WhiskeyWigInterpolationNode(v.value)
    case WhiskeyWigNodeValueType.INTERPOLATION_ERROR:
      return new WhiskeyWigInterpolationErrorNode(v.value, v.error)
  }
}
