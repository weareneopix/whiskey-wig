import {tokenizeTextNode} from '../src/ast'
import {WhiskeyWigTextNode, WhiskeyWigInterpolationErrorNode, WhiskeyWigInterpolationNode} from '../src/ww-nodes'
import * as utils from './testing-utils'

describe(`tokenizeTextNode`, () => {

  const acceptAll = () => null

  it(`should tokenize a simple string as a text node`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`foo`)
    const expected = [
      new WhiskeyWigTextNode(`foo`),
    ]
    expect(tokenizeTextNode(domNode, acceptAll)).toEqual(expected)
  })

  it(`should tokenize a string containing only interpolation`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`{{ foo }}`)
    const expected = [
      new WhiskeyWigInterpolationNode(` foo `),
    ]
    expect(tokenizeTextNode(domNode, acceptAll)).toEqual(expected)
  })

  it(`should tokenize interpolation in the middle of text`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`foo {{ bar }} baz`)
    const expected = [
      new WhiskeyWigTextNode(`foo `),
      new WhiskeyWigInterpolationNode(` bar `),
      new WhiskeyWigTextNode(` baz`),
    ]
    expect(tokenizeTextNode(domNode, acceptAll)).toEqual(expected)
  })

  it(`should tokenize a few interpolations`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`{{foo}}bar{{baz}}qux`)
    const expected = [
      new WhiskeyWigInterpolationNode(`foo`),
      new WhiskeyWigTextNode(`bar`),
      new WhiskeyWigInterpolationNode(`baz`),
      new WhiskeyWigTextNode(`qux`),
    ]
    expect(tokenizeTextNode(domNode, acceptAll)).toEqual(expected)
  })

  it(`should not leave an empty text between two interpolations`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`{{foo}}{{bar}}`)
    const expected = [
      new WhiskeyWigInterpolationNode(`foo`),
      new WhiskeyWigInterpolationNode(`bar`),
    ]
    expect(tokenizeTextNode(domNode, acceptAll)).toEqual(expected)
  })

  it(`should differentiate between known and unknown`, () => {
    const domNode = utils.emptyDom().window.document.createTextNode(`{{foo}}{{bar}}`)
    const expected = [
      new WhiskeyWigInterpolationNode(`foo`),
      new WhiskeyWigInterpolationErrorNode(`bar`, `"bar" is not recognized.`),
    ]
    expect(tokenizeTextNode(domNode, val => val == 'foo' ? null : val => `"${val}" is not recognized.`))
      .toEqual(expected)
  })

})
