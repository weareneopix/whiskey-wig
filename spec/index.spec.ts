import {JSDOM} from 'jsdom'
import {TreeNode} from '../src/tree'
import {Forest} from '../src/forest'
import {WhiskeyWigHtmlNode, WhiskeyWigNode, WhiskeyWigNodeValue, WhiskeyWigTextNode} from '../src/ww-nodes'
import {getWwForest, stripSyntaxHighlightTags, wrapInTreeNodes} from '../src/ast'
import * as utils from './testing-utils'

describe(`WhiskeyWig`, () => {

  describe(`wrapInTreeNodes`, () => {
    it(`should wrap something simple`, () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="content">foo <b>bar</b> baz</div>`)
      ;(global as any)['Node'] = dom.window.Node
      const editor = dom.window.document.getElementById('content')!
      const [foo, b, baz] = Array.from(editor.childNodes)
      const bar = b.childNodes[0]
      const wrapped = wrapInTreeNodes(editor)
      const expected = new Forest<Node, TreeNode<Node>>([
        new TreeNode(foo),
        new TreeNode(b, [
          new TreeNode(bar),
        ]),
        new TreeNode(baz),
      ])
      expect(wrapped).toEqual(expected)
    })
    it(`should wrap something complex`, () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="content">foo <b>bar <span class="ww">{{ i1 }}</span> baz</b><i>qux</i><div><ul><li>1</li><li><b><i>2</i></b></li></ul></div></div>`)
      ;(global as any).Node = dom.window.Node
      const editor = dom.window.document.getElementById('content')!
      const [foo, bBarI1Baz, iQux, div] = Array.from(editor.childNodes)
      const [bar, span, baz] = Array.from(bBarI1Baz.childNodes)
      const [qux] = Array.from(iQux.childNodes)
      const [i1] = Array.from(span.childNodes)
      const [ul] = Array.from(div.childNodes)
      const [li1, li2] = Array.from(ul.childNodes)
      const [one] = Array.from(li1.childNodes)
      const [bi2] = Array.from(li2.childNodes)
      const [i2] = Array.from(bi2.childNodes)
      const [two] = Array.from(i2.childNodes)
      expect([foo, bBarI1Baz, iQux, div, bar, span, baz, i1, ul, li1, li2, one, bi2, i2, two].every(x => x != null))
        .toBe(true)
      const expected = new Forest<Node, TreeNode<Node>>([
        new TreeNode(foo),
        new TreeNode(bBarI1Baz, [
          new TreeNode(bar),
          new TreeNode(span, [
            new TreeNode(i1),
          ]),
          new TreeNode(baz),
        ]),
        new TreeNode(iQux, [
          new TreeNode(qux),
        ]),
        new TreeNode(div, [
          new TreeNode(ul, [
            new TreeNode(li1, [
              new TreeNode(one),
            ]),
            new TreeNode(li2, [
              new TreeNode(bi2, [
                new TreeNode(i2, [
                  new TreeNode(two),
                ]),
              ]),
            ]),
          ]),
        ]),
      ])
      expect(wrapInTreeNodes(editor)).toEqual(expected)
    })
  })

  describe(`stripSyntaxHighlightingTags`, () => {
    it(`should strip a single interpolation`, () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="content"><span class="ww">{{ interpolation }}</span></div>`)
      ;(global as any).Node = dom.window.Node
      ;(global as any).HTMLElement = dom.window.HTMLElement
      const $content = dom.window.document.getElementById('content')!
      const [span] = Array.from($content.childNodes)
      const [interpolation] = Array.from(span.childNodes)
      const expected = new Forest<Node, TreeNode<Node>>([
        new TreeNode(interpolation),
      ])
      const all = new Forest<Node, TreeNode<Node>>([
        new TreeNode(span, [
          new TreeNode(interpolation),
        ]),
      ])
      stripSyntaxHighlightTags(all)
      expect(all).toEqual(expected)
    })
    it(`should strip from a complex tree`, () => {
      const dom = new JSDOM(`<!DOCTYPE html><div id="content">foo <b>bar <span class="ww">{{ i1 }}</span> baz</b><i>qux</i><div><ul><li>1</li><li><b><i>2</i></b></li></ul></div></div>`)
      ;(global as any).Node = dom.window.Node
      ;(global as any).HTMLElement = dom.window.HTMLElement
      const $content = dom.window.document.getElementById('content')!
      const [foo, bBarI1Baz, iQux, div] = Array.from($content.childNodes)
      const [bar, span, baz] = Array.from(bBarI1Baz.childNodes)
      const [qux] = Array.from(iQux.childNodes)
      const [i1] = Array.from(span.childNodes)
      const [ul] = Array.from(div.childNodes)
      const [li1, li2] = Array.from(ul.childNodes)
      const [one] = Array.from(li1.childNodes)
      const [bi2] = Array.from(li2.childNodes)
      const [i2] = Array.from(bi2.childNodes)
      const [two] = Array.from(i2.childNodes)
      expect([foo, bBarI1Baz, iQux, div, bar, span, baz, i1, ul, li1, li2, one, bi2, i2, two].every(x => x != null))
        .toBe(true)
      const all = new Forest<Node, TreeNode<Node>>([
        new TreeNode(foo),
        new TreeNode(bBarI1Baz, [
          new TreeNode(bar),
          new TreeNode(span, [
            new TreeNode(i1),
          ]),
          new TreeNode(baz),
        ]),
        new TreeNode(iQux, [
          new TreeNode(qux),
        ]),
        new TreeNode(div, [
          new TreeNode(ul, [
            new TreeNode(li1, [
              new TreeNode(one),
            ]),
            new TreeNode(li2, [
              new TreeNode(bi2, [
                new TreeNode(i2, [
                  new TreeNode(two),
                ]),
              ]),
            ]),
          ]),
        ]),
      ])
      const expected = new Forest<Node, TreeNode<Node>>([
        new TreeNode(foo),
        new TreeNode(bBarI1Baz, [
          new TreeNode(bar),
          // new TreeNode(span, [
          /**/new TreeNode(i1),
          // ]),
          new TreeNode(baz),
        ]),
        new TreeNode(iQux, [
          new TreeNode(qux),
        ]),
        new TreeNode(div, [
          new TreeNode(ul, [
            new TreeNode(li1, [
              new TreeNode(one),
            ]),
            new TreeNode(li2, [
              new TreeNode(bi2, [
                new TreeNode(i2, [
                  new TreeNode(two),
                ]),
              ]),
            ]),
          ]),
        ]),
      ])
      stripSyntaxHighlightTags(all)
      expect(all).toEqual(expected)
    })
  })

  describe(`getWwForest`, () => {
    const dom = utils.emptyDom()
    beforeEach(() => {
      (global as any).Text = dom.window.Text
    })
    it(`should work for simple text`, () => {
      const domNodeForest = new Forest<Node, TreeNode<Node>>([
        new TreeNode(dom.window.document.createTextNode(`test`)),
      ])
      const wwForest = new Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>([
        new WhiskeyWigTextNode(`test`),
      ])
      expect(getWwForest(domNodeForest, () => null)).toEqual(wwForest)
    })
    it(`should work for two simple nodes`, () => {
      const domNodeForest = new Forest<Node, TreeNode<Node>>([
        new TreeNode<Node>(dom.window.document.createElement('span'), [
          new TreeNode<Node>(dom.window.document.createTextNode(`1234`)),
        ]),
        new TreeNode<Node>(dom.window.document.createElement('span'), [
          new TreeNode<Node>(dom.window.document.createTextNode(`5678`)),
        ]),
      ])
      const wwForest = new Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>([
        new WhiskeyWigHtmlNode('SPAN', [], [
          new WhiskeyWigTextNode(`1234`),
        ]),
        new WhiskeyWigHtmlNode('SPAN', [], [
          new WhiskeyWigTextNode(`5678`),
        ]),
      ])
      expect(getWwForest(domNodeForest, () => null)).toEqual(wwForest)
    })
    it(`should work for deeply nested elements`, () => {
      const domNodeForest = new Forest<Node, TreeNode<Node>>([
        new TreeNode<Node>(dom.window.document.createElement('b'), [
          new TreeNode<Node>(dom.window.document.createTextNode(`bold`)),
          new TreeNode<Node>(dom.window.document.createElement('i'), [
            new TreeNode<Node>(dom.window.document.createTextNode(`italic`)),
            new TreeNode<Node>(dom.window.document.createElement('u'), [
              new TreeNode<Node>(dom.window.document.createTextNode(`underline`)),
            ]),
          ]),
        ]),
      ])
      const wwForest = new Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>([
        new WhiskeyWigHtmlNode('B', [], [
          new WhiskeyWigTextNode(`bold`),
          new WhiskeyWigHtmlNode('I', [], [
            new WhiskeyWigTextNode(`italic`),
            new WhiskeyWigHtmlNode('U', [], [
              new WhiskeyWigTextNode(`underline`),
            ]),
          ]),
        ]),
      ])
      expect(getWwForest(domNodeForest, () => null)).toEqual(wwForest)
    })
    it(`should work for empty forest`, () => {
      const domNodeForest = new Forest<Node, TreeNode<Node>>()
      const wwForest = new Forest<WhiskeyWigNodeValue, WhiskeyWigNode<WhiskeyWigNodeValue>>()
      expect(getWwForest(domNodeForest, () => null)).toEqual(wwForest)
    })
  })

})
