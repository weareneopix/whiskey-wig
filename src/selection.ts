import {TreeNode} from './tree'
import {Forest} from './forest'

export interface AbsoluteSelection {
  anchor: number
  focus: number
}

export interface RelativeSelection {
  anchorNode: Node
  anchorOffset: number
  focusNode: Node
  focusOffset: number
}

/**
 * Based on the current selection, determine the absolute offset of the selection in the forest.
 * When removing/adding syntax highlighting tags, we do not mess with the character count, so the
 * returns value of this function can serve as the source of truth.
 *
 * The only exception is handing of the <br> tag, which can mess up the characters. Because of this,
 * HTMLBRElement tags are stripped and replaced with a newline character. In order to present this
 * change visually, the editor's white-space property is also changed.
 *
 * In case of an error, it returns null.
 *
 * @param forest The forest which represents the DOM structure of the editor.
 * @param selection The selection, expected to be obtained via `window.getSelection()`.
 */
export function getAbsoluteSelection(forest: Forest<Node, TreeNode<Node>>, selection: Selection): AbsoluteSelection | null {
  let charCount: number = 0

  let anchor: number = -1
  let focus: number = -1

  if (forest.getRoots().length == 0) {
    return {anchor: 0, focus: 0}
  }

  forest.preOrder(node => {
    const domNode = node.getValue()

    if (selection.anchorNode == domNode) {
      if (domNode instanceof Text) {
        anchor = charCount + selection.anchorOffset
      } else if (domNode instanceof Element) {
        const childNodesOfAnchorNodePrecedingTheAnchor = Array.from(domNode.childNodes)
          .slice(0, selection.anchorOffset + 1)
        const length = childNodesOfAnchorNodePrecedingTheAnchor.reduce((len, node) => len + (node.textContent || '').length, 0)
        anchor = charCount + length
      }
    }

    if (selection.focusNode == domNode) {
      if (domNode instanceof Text) {
        focus = charCount + selection.focusOffset
      } else if (domNode instanceof Element) {
        const childNodesOfFocusNodePrecedingTheFocus = Array.from(domNode.childNodes)
          .slice(0, selection.focusOffset + 1)
        const length = childNodesOfFocusNodePrecedingTheFocus.reduce((len, node) => len + (node.textContent || '').length, 0)
        focus = charCount + length
      }
    }

    if (!node.hasChildren() && domNode instanceof Text) {
      charCount += domNode.data.length
    }
  })

  if (anchor == -1 || focus == -1) {
    return null
  }

  return {anchor, focus}
}

/**
 * Inverse of getting absolute selection.
 *
 * Based on an absolute offset, it gets the relative selection parameters which are necessary to reconstruct
 * the selection.
 *
 * In case of an error, it returns null.
 *
 * @param editor The editor HTMLElement.
 * @param absoluteSelection The absolute selection used to reconstruct the relative selection.
 */
export function getRelativeSelection(editor: HTMLElement, absoluteSelection: AbsoluteSelection): RelativeSelection | null {
  let {anchor, focus} = absoluteSelection
  const result: Partial<RelativeSelection> = {}

  const queue: Node[] = Array.from(editor.childNodes)
  let current: Node | null = null
  let lastTextNode: Text | null = null

  if (queue.length == 0) {
    return {
      anchorNode: editor,
      anchorOffset: 0,
      focusNode: editor,
      focusOffset: 0,
    }
  }

  while (queue.length > 0) {
    current = queue.shift()!
    queue.unshift(...Array.from(current.childNodes))

    if (current instanceof Text) {
      anchor -= current.data.length
      focus -= current.data.length

      if (result.anchorNode == null && anchor < 0) {
        result.anchorNode = current
        result.anchorOffset = anchor + current.data.length
      }

      if (result.focusNode == null && focus < 0) {
        result.focusNode = current
        result.focusOffset = focus + current.data.length
      }

      lastTextNode = current
    }
  }

  if (anchor == 0 && lastTextNode != null) {
    result.anchorNode = lastTextNode
    result.anchorOffset = lastTextNode.data.length
  }

  if (focus == 0 && lastTextNode != null) {
    result.focusNode = lastTextNode
    result.focusOffset = lastTextNode.data.length
  }

  if (result.anchorOffset == null || result.anchorNode == null || result.focusOffset == null || result.focusNode == null) {
    return null
  }

  return result as RelativeSelection
}

/**
 * Selects text based on the relative selection.
 *
 * @param relativeSelection
 */
export function select(relativeSelection: RelativeSelection): void {
  const selection = window.getSelection()
  const range = document.createRange()
  // TODO: seems like this doesn't work when selecting right to left (in ltr text)
  range.setStart(relativeSelection.anchorNode, relativeSelection.anchorOffset)
  range.setEnd(relativeSelection.focusNode, relativeSelection.focusOffset)
  selection.removeAllRanges()
  selection.addRange(range)
}