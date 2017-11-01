import React from 'react';
import { mount, shallow } from 'enzyme';

import ListFolder from '../src/ListFolder';

describe('Component <ListFolder />', () => {
  const wrapper = shallow(
    <ListFolder>
      <li className="first">First</li>
      <li className="second">Second</li>
      <li className="third">Third</li>
      <li className="fourth">Fourth</li>
    </ListFolder>,
  );

  it('Should only display the first three children.', () => {
    expect(wrapper.find('.third').exists()).toBe(true);
    expect(wrapper.find('.fourth').exists()).toBe(false);
  });

  it('Should display the view more text if provided.', () => {
    const viewMoreText = 'view!';
    wrapper.setProps({
      viewMoreText,
    });

    expect(wrapper.find('.text').text()).toEqual(viewMoreText);
  });

  it('Should display the fold text if provided.', () => {
    const viewMoreWrapper = shallow(
      <ListFolder defaultFold={false}>
        <li className="first">First</li>
        <li className="second">Second</li>
        <li className="third">Third</li>
        <li className="fourth">Fourth</li>
      </ListFolder>,
    );

    const foldText = 'fold!';
    viewMoreWrapper.setProps({
      foldText,
    });

    expect(viewMoreWrapper.find('.text').text()).toEqual(foldText);
  });

  it('Should display all four children if default fold is false.', () => {
    const viewMoreWrapper = shallow(
      <ListFolder defaultFold={false}>
        <li className="first">First</li>
        <li className="second">Second</li>
        <li className="third">Third</li>
        <li className="fourth">Fourth</li>
      </ListFolder>,
    );

    expect(viewMoreWrapper.find('.third').exists()).toBe(true);
    expect(viewMoreWrapper.find('.fourth').exists()).toBe(true);
  });

  it('Should not render action button if fold count is larger than the length of children.', () => {
    wrapper.setProps({
      foldCount: 5,
    });

    expect(wrapper.find('.action').exists()).toBe(false);
  });

  it('Should expand if view more button clicked.', () => {
    jest.useFakeTimers();

    const viewMoreWrapper = mount(
      <ListFolder>
        <li className="first">First</li>
        <li className="second">Second</li>
        <li className="third">Third</li>
        <li className="fourth">Fourth</li>
      </ListFolder>,
    );

    // Trigger abnormal branch test.
    viewMoreWrapper.find('.action').simulate('click');
    viewMoreWrapper.find('.action').simulate('click');

    expect(setTimeout.mock.calls.length).toBe(1);
    expect(setTimeout.mock.calls[0][1]).toBe(300);

    jest.runOnlyPendingTimers();
  });

  it('Should fold if view more button clicked.', () => {
    jest.useFakeTimers();

    const viewMoreWrapper = mount(
      <ListFolder defaultFold={false}>
        <li className="first">First</li>
        <li className="second">Second</li>
        <li className="third">Third</li>
        <li className="fourth">Fourth</li>
      </ListFolder>,
    );

    viewMoreWrapper.find('.action').simulate('click');

    expect(setTimeout.mock.calls.length).toBe(1);
    expect(setTimeout.mock.calls[0][1]).toBe(300);

    jest.runOnlyPendingTimers();
  });

  it('Should clear timer if timer exists when unmount.', () => {
    const viewMoreWrapper = mount(
      <ListFolder defaultFold={false}>
        <li className="first">First</li>
        <li className="second">Second</li>
        <li className="third">Third</li>
        <li className="fourth">Fourth</li>
      </ListFolder>,
    );

    // Trigger height changed.
    viewMoreWrapper.instance().applyListHeight(200);

    const foldHeight = viewMoreWrapper.instance().foldHeight;

    viewMoreWrapper.find('.action').simulate('click');

    viewMoreWrapper.unmount();
    expect(foldHeight).toBe(null);
  });
});
