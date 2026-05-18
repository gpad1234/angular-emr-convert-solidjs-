import { mount } from '@vue/test-utils'
import NavBar from '../NavBar.vue'
import { describe, it, expect, vi } from 'vitest'

describe('NavBar', () => {
  it('dispatches app-refresh event when link clicked', async () => {
    const wrapper = mount(NavBar, {
      global: {
        // stub router-link to render the inner content and not require full router
        components: {
          'router-link': {
            props: ['to'],
            template: '<a><slot /></a>'
          }
        }
      }
    })

    const spy = vi.spyOn(window, 'dispatchEvent')
    await wrapper.findAll('a')[1].trigger('click') // click Patients link
    expect(spy).toHaveBeenCalled()
    const calledWith = spy.mock.calls[0][0]
    expect(calledWith.type).toBe('app-refresh')
  })
})
