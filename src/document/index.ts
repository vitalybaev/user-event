import {dispatchUIEvent} from '../event'
import {Config} from '../setup'
import {prepareSelectionInterceptor} from './selection'
import {
  clearInitialValue,
  getInitialValue,
  prepareValueInterceptor,
} from './value'

const isPrepared = Symbol('Node prepared with document state workarounds')

declare global {
  interface Node {
    [isPrepared]?: typeof isPrepared
  }
}

export function prepareDocument(document: Document) {
  if (document[isPrepared]) {
    return
  }

  document.addEventListener(
    'focus',
    e => {
      const el = e.target as Node

      prepareElement(el)
    },
    {
      capture: true,
      passive: true,
    },
  )

  // Our test environment defaults to `document.body` as `activeElement`.
  // In other environments this might be `null` when preparing.
  // istanbul ignore else
  if (document.activeElement) {
    prepareElement(document.activeElement)
  }

  document.addEventListener(
    'blur',
    e => {
      const el = e.target as HTMLInputElement
      const initialValue = getInitialValue(el)
      if (initialValue !== undefined) {
        if (el.value !== initialValue) {
          dispatchUIEvent({} as Config, el, 'change')
        }
        clearInitialValue(el)
      }
    },
    {
      capture: true,
      passive: true,
    },
  )

  document[isPrepared] = isPrepared
}

function prepareElement(el: Node | HTMLInputElement) {
  if (el[isPrepared]) {
    return
  }

  if ('value' in el) {
    prepareValueInterceptor(el)
    prepareSelectionInterceptor(el)
  }

  el[isPrepared] = isPrepared
}

export {
  getUIValue,
  setUIValue,
  startTrackValue,
  endTrackValue,
  clearInitialValue,
} from './value'
export {getUISelection, setUISelection} from './selection'
export type {UISelectionRange} from './selection'
