import {
  WhiskeyWigHtmlNode,
  WhiskeyWigNode,
  WhiskeyWigNodeValue,
  WhiskeyWigTextNode,
  WhiskyWigInterpolationErrorNode,
  WhiskyWigInterpolationNode,
} from '../ww-nodes'
import {Forest} from '../forest'
import {TreeNode} from '../tree'

function getAttributes(node: HTMLElement): [string, any][] {
  const result: [string, any][] = []
  for (const attribute of Array.from(node.attributes)) {
    result.push([attribute.name, attribute.value])
  }
  return result
}

const HANDLEBARS_REGEX = /{{([^{}]+?)}}/g

/**
 * Parses a text node and produces an array of WWNodes, making a difference between:
 *   - simple text,
 *   - interpolation and
 *   - invalid interpolation.
 *
 * Validity of the interpolation var name is determined via the function passed in as the second argument.
 *
 * @param domNode
 * @param isInterpolationValid
 */
export function tokenizeTextNode(domNode: Node, isInterpolationValid: (str: string) => ((str: string) => string) | null): WhiskeyWigNode<WhiskeyWigNodeValue>[] {
  const text = domNode.nodeValue!
  const array = text.split(HANDLEBARS_REGEX)
  const nodes: WhiskeyWigNode<WhiskeyWigNodeValue>[] = []
  array.forEach((chunk, index) => {
    // The regex will turn "{{ foo }}" into ['', 'foo', ''].
    // We must keep them in order to maintain the indexes, so we skip them as special cases.
    if ((index == 0 || index == array.length - 1) && chunk == '') {
      return
    }

    const isText = index % 2 == 0
    if (isText) {
      if (chunk != '') {
        nodes.push(new WhiskeyWigTextNode(chunk))
      }
    } else {
      const valid = isInterpolationValid(chunk)
      if (valid === null) {
        nodes.push(new WhiskyWigInterpolationNode(chunk))
      } else {
        nodes.push(new WhiskyWigInterpolationErrorNode(chunk, valid(chunk)))
      }
    }
  })
  return nodes
}

/**
 * Strips away tags which serve only to syntax highlight the text.
 * @param forest
 */
export function stripSyntaxHighlightTags(forest: Forest<Node, TreeNode<Node>>): void {
  forest.preOrder(node => {
    const domNode = node.getValue()
    if (domNode instanceof HTMLElement) {
      if (domNode.tagName == 'SPAN' && domNode.classList.contains('ww')) {
        node.removeAndFlatten()
      }
    }
  }, true)
}

/**
 * Helper recursive function which creates the AST from the HTML structure.
 * It expects the HTML structure to have stripped syntax highlighting tags.
 *
 * @param roots
 * @param isInterpolationValid
 * @private
 */
function _getWwForest(roots: TreeNode<Node>[], isInterpolationValid: (str: string) => ((str: string) => string) | null): WhiskeyWigNode<WhiskeyWigNodeValue>[] {
  const result: WhiskeyWigNode<WhiskeyWigNodeValue>[] = []
  roots.forEach(root => {
    const domNode = root.getValue()
    if (domNode instanceof HTMLElement) {
      if (domNode.tagName == 'BR') {
        result.push(new WhiskeyWigTextNode(`\n`))
      } else {
        const children = _getWwForest(root.getChildren(), isInterpolationValid)
        const wwNode = new WhiskeyWigHtmlNode(domNode.tagName, getAttributes(domNode), children)
        result.push(wwNode)
      }
    } else if (domNode instanceof Text) {
      result.push(...tokenizeTextNode(domNode, isInterpolationValid))
    }
  })
  return result
}

/**
 * Create an AST from the HTML structure.
 * Expects the HTML structure to have stripped syntax highlighting tags.
 *
 * @param forest
 * @param isInterpolationValid
 */
export function getWwForest(forest: Forest<Node, TreeNode<Node>>, isInterpolationValid: (str: string) => ((str: string) => string) | null): Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>> {
  return new Forest(_getWwForest(forest.getRoots(), isInterpolationValid))
}

function _wrapInTreeNodes(node: Node): TreeNode<Node>[] {
  const result: TreeNode<Node>[] = []
  for (let i = 0; i < node.childNodes.length; i++) {
    const childNode = node.childNodes.item(i)
    switch (childNode.nodeType) {
      case Node.TEXT_NODE:
        result.push(new TreeNode(childNode))
        break
      case Node.ELEMENT_NODE:
        result.push(new TreeNode(childNode, _wrapInTreeNodes(childNode)))
        break
    }
  }
  return result
}

export function wrapInTreeNodes(editor: HTMLElement): Forest<Node, TreeNode<Node>> {
  return new Forest<Node, TreeNode<Node>>(_wrapInTreeNodes(editor))
}
