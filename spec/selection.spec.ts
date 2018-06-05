import {getAbsoluteSelection, getRelativeSelection} from '../src/selection'
import {JSDOM} from 'jsdom'
import {wrapInTreeNodes} from '../src/ast'

describe(`getAbsoluteSelection`, () => {
  let dom: JSDOM
  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html>
<div id="content1">0123456</div>
<div id="content2"><span>0123</span><span>4567</span></div>
<div id="content3"><span>0<span>1<span>2<span>3<span>4</span></span></span></span></span>5678</div>
<div id="content4"></div>
`)
    ;(global as any).Node = dom.window.Node
    ;(global as any).HTMLElement = dom.window.HTMLElement
    ;(global as any).Text = dom.window.Text
    ;(global as any).Element = dom.window.Element
  })
  it(`should work for a simple text selection`, () => {
    const editor = dom.window.document.getElementById('content1')!
    const text = editor.firstChild!
    const selection = {
      anchorNode: text,
      anchorOffset: 0,
      focusNode: text,
      focusOffset: 7,
    } as any as Selection
    const wrapped = wrapInTreeNodes(editor)
    expect(getAbsoluteSelection(wrapped, selection)).toEqual({anchor: 0, focus: 7})
  })
  it(`should work when selection spans across two elements`, () => {
    const editor = dom.window.document.getElementById(`content2`)!
    const [span1, span2] = Array.from(editor.childNodes)
    const text1 = span1.firstChild!
    const text2 = span2.firstChild!
    const wrapped = wrapInTreeNodes(editor)
    const selection = {
      anchorNode: text1,
      anchorOffset: 2,
      focusNode: text2,
      focusOffset: 2,
    } as any as Selection
    expect(getAbsoluteSelection(wrapped, selection)).toEqual({anchor: 2, focus: 6})
  })
  it(`should work when selection spans across different levels in the tree`, () => {
    const editor = dom.window.document.getElementById('content3')!
    const s0 = editor.firstChild!
    const s1 = s0.lastChild!
    const s2 = s1.lastChild!
    const s3 = s2.lastChild!
    const s4 = s3.lastChild!
    const four = s4.firstChild!
    const fiveSixSevenEight = editor.lastChild!
    const selection = {
      anchorNode: four,
      anchorOffset: 0,
      focusNode: fiveSixSevenEight,
      focusOffset: 1,
    } as any as Selection
    expect(getAbsoluteSelection(wrapInTreeNodes(editor), selection)).toEqual({anchor: 4, focus: 6})
  })
  it(`should work when there is no text`, () => {
    const editor = dom.window.document.getElementById('content4')!
    const selection = {
      anchorNode: editor,
      anchorOffset: 0,
      focusNode: editor,
      focusOffset: 0,
    } as any as Selection
    expect(getAbsoluteSelection(wrapInTreeNodes(editor), selection)).toEqual({anchor: 0, focus: 0})
  })
})

describe(`getRelativeSelection`, () => {
  let dom: JSDOM
  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html>
<div id="content1">0123456</div>
<div id="content2"><span>0123</span><span>4567</span></div>
<div id="content3"><span>0<span>1<span>2<span>3<span>4</span></span></span></span></span>5678</div>
<div id="content4"></div>
<div id="content5">foo <b>bar</b> baz</div>
`)
    ;(global as any).Node = dom.window.Node
    ;(global as any).HTMLElement = dom.window.HTMLElement
    ;(global as any).Text = dom.window.Text
    ;(global as any).Element = dom.window.Element
    ;(global as any).window = dom.window
    ;(global as any).document = dom.window.document
  })

  it(`should work for a simple text selection`, () => {
    const editor = dom.window.document.getElementById('content1')!
    const text = editor.firstChild!
    expect(getRelativeSelection(editor, {anchor: 0, focus: 7})).toEqual({
      anchorNode: text,
      anchorOffset: 0,
      focusNode: text,
      focusOffset: 7,
    })
  })
  it(`should work when selection spans across two elements`, () => {
    const editor = dom.window.document.getElementById(`content2`)!
    const [span1, span2] = Array.from(editor.childNodes)
    const text1 = span1.firstChild!
    const text2 = span2.firstChild!
    expect(getRelativeSelection(editor, {anchor: 2, focus: 6})).toEqual({
      anchorNode: text1,
      anchorOffset: 2,
      focusNode: text2,
      focusOffset: 2,
    })
  })
  it(`should work when selection spans across different levels in the tree`, () => {
    const editor = dom.window.document.getElementById('content3')!
    const s0 = editor.firstChild!
    const s1 = s0.lastChild!
    const s2 = s1.lastChild!
    const s3 = s2.lastChild!
    const s4 = s3.lastChild!
    const four = s4.firstChild!
    const fiveSixSevenEight = editor.lastChild!
    expect(getRelativeSelection(editor, {anchor: 4, focus: 6})).toEqual({
      anchorNode: four,
      anchorOffset: 0,
      focusNode: fiveSixSevenEight,
      focusOffset: 1,
    })
  })
  it(`should work when there is nothing`, () => {
    const editor = dom.window.document.getElementById('content4')!
    expect(getRelativeSelection(editor, {anchor: 0, focus: 0})).toEqual({
      anchorNode: editor,
      anchorOffset: 0,
      focusNode: editor,
      focusOffset: 0,
    })
  })
  it(`should work when selection spans from start of node until start of next text`, () => {
    const editor = dom.window.document.getElementById('content5')!
    const b = editor.childNodes[1]
    const bar = b.firstChild!
    const baz = editor.lastChild!
    expect(getRelativeSelection(editor, {anchor: 4, focus: 7})).toEqual({
      anchorNode: bar,
      anchorOffset: 0,
      focusNode: baz,
      focusOffset: 0,
    })
  })
})

