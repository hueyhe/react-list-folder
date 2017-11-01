import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import cssModules from 'react-css-modules';

import classnames from 'classnames';

import styles from './style.css';

class ListFolder extends Component {
  static propTypes = {
    /**
     * Auto reset fold status if number of children changed.
     *
     * @type {boolean}
     */
    autoReset: PropTypes.bool,

    /**
     * Content nodes of view more.
     * Should be a list of React/DOM node.
     *
     * @type {array}
     */
    children: PropTypes.arrayOf(PropTypes.node),

    /**
     * Class name of the view more list node.
     *
     * @ignore
     * @type {string}
     */
    className: PropTypes.string,

    /**
     * List would display fold initially if true.
     *
     * @type {boolean}
     */
    defaultFold: PropTypes.bool,

    /**
     * Expand & fold animation duration.
     *
     * @type {number}
     */
    duration: PropTypes.number,

    /**
     * View more would display if number of child nodes larger than foldCount.
     *
     * @type {number}
     */
    foldCount: PropTypes.number,

    /**
     * Fold text of action button.
     *
     * @type {string}
     */
    foldText: PropTypes.string,

    /**
     * View more text of action button.
     *
     * @type {string}
     */
    viewMoreText: PropTypes.string,
  }

  static defaultProps = {
    autoReset: true,
    defaultFold: true,
    duration: 300,
    foldCount: 3,
    foldText: 'Fold',
    viewMoreText: 'View More',
  }

  constructor(props) {
    super(props);

    this.state = {
      currentText: '',
      fold: false,
      maxHeight: 0,

      // Somehow list height might change because of, for example, window resize.
      // But we do not care about list height after animation ended.
      // Use this flag to free ourselves from remembering the max height of the list.
      // Max height would apply to list container if set to false.
      // Which will cause animation.
      static: true,
    };

    // Lock flag.
    this.animating = false;
    this.animationTimer = null;

    // Fake fold flag.
    this.fakeFold = false;
    this.foldHeight = null;

    this.handleViewMoreClick = this.handleViewMoreClick.bind(this);
  }

  componentWillMount() {
    const {
      defaultFold,
      foldText,
      viewMoreText,
    } = this.props;

    // Init fold info.
    this.setState({
      currentText: defaultFold ? viewMoreText : foldText,
      fold: defaultFold,
    });
  }

  componentDidMount() {
    // Init list height.
    this.applyListHeight();
  }

  componentWillReceiveProps(nextProps) {
    const {
      autoReset,
      children,
      defaultFold,
      foldText,
      viewMoreText,
    } = nextProps;

    const { fold } = this.state;
    this.setState({
      currentText: fold ? viewMoreText : foldText,
    });

    if (autoReset) {
      if (Children.count(this.props.children) !== Children.count(children)) {
        // Reset component state if props changed.
        this.clearFlags();
        this.setState({
          currentText: defaultFold ? viewMoreText : foldText,
          fold: defaultFold,
        });
      }
    }
  }

  componentDidUpdate() {
    // Suggest that user clicked view more or fold.
    // If it is a fake fold, no need to apply list height.
    // If it is animating, no need to apply
    // cause apply would be called in setState callback during animation.
    if (!this.fakeFold && !this.animating) {
      this.applyListHeight();
    }
  }

  componentWillUnmount() {
    this.clearFlags();
  }

  // Change the max height of list.
  applyListHeight(height) {
    const childRect = this.childContainer.getBoundingClientRect();
    const maxHeight = height || childRect.height;
    if (this.state.maxHeight === maxHeight) {
      return;
    }
    this.setState({
      maxHeight,
    });
  }

  // Clear component flag status.
  // Used to reset component state.
  clearFlags() {
    this.animating = false;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    this.fakeFold = false;
    this.foldHeight = null;
  }

  handleViewMoreClick() {
    const {
      duration,
      foldText,
      viewMoreText,
    } = this.props;
    const { fold } = this.state;

    // Do not respond if the list is animating.
    // It is hard to determine when to trigger animation callback
    // if you change the end status of an ongoing animation.
    if (this.animating) {
      return;
    }

    this.animating = true;
    // Applying max height to list container.
    this.setState({
      static: false,
    });

    if (fold) {
      this.setState({
        currentText: foldText,
        fold: false,
      }, () => {
        // Manually apply height here,
        // cause during animation it won't trigger height applying in did update.
        this.applyListHeight();
      });
      this.animationTimer = setTimeout(() => {
        this.animationTimer = null;
        this.animating = false;
        // Remove max height from list container.
        this.setState({
          static: true,
        });
      }, duration);
      return;
    }

    // Fake fold.
    // In order to get the height of the children.
    this.fakeFold = true;
    this.setState({
      currentText: viewMoreText,
      fold: true,
    }, () => {
      const childRect = this.childContainer.getBoundingClientRect();
      this.foldHeight = childRect.height;
      // Set children back.
      // Prepare for animation.
      this.setState({
        fold: false,
      }, () => {
        this.fakeFold = false;
        // Apply animation.
        this.applyListHeight(this.foldHeight);
        // Ready for callback.
        this.animationTimer = setTimeout(() => {
          this.animationTimer = null;
          this.animating = false;
          // Detach extra child nodes after list folded.
          // Also remove max height from list container.
          this.setState({
            fold: true,
            static: true,
          });
        }, duration);
      });
    });
  }

  renderAction() {
    const {
      children,
      foldCount,
      foldText,
      viewMoreText,
    } = this.props;

    if (Children.count(children) <= foldCount) {
      return null;
    }

    const { currentText } = this.state;

    const iconClassNames = classnames('icon', {
      'icon-down': currentText === viewMoreText,
      'icon-up': currentText === foldText,
    });

    return (
      <footer
        styleName="action"
        onClick={this.handleViewMoreClick}
        role="presentation"
      >
        <span styleName="text">{ currentText }</span>
        <span styleName={iconClassNames}>
          <Icon type="arrow" />
        </span>
      </footer>
    );
  }

  // Render children.
  renderChildren() {
    const {
      children,
      foldCount,
    } = this.props;

    const { fold } = this.state;

    if (!fold) {
      return children;
    }

    const childrenArr = Children.toArray(children);
    return childrenArr.slice(0, foldCount);
  }

  renderMain() {
    const {
      className,
      duration,
    } = this.props;
    const { maxHeight } = this.state;

    const contentStyle = {};

    if (!this.state.static) {
      contentStyle.height = `${maxHeight}px`;
      contentStyle.transitionDuration = `${duration}ms`;
    }

    return (
      <main
        styleName="child-list"
        style={contentStyle}
      >
        <ul
          className={className}
          ref={(childContainer) => { this.childContainer = childContainer; }}
          styleName="list"
        >
          { this.renderChildren() }
        </ul>
      </main>
    );
  }

  render() {
    return (
      <div styleName="component-view-more">
        { this.renderMain() }
        { this.renderAction() }
      </div>
    );
  }
}

export default cssModules(ListFolder, styles, { allowMultiple: true });
