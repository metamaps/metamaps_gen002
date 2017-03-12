import React, { Component, PropTypes } from 'react'

import AccountMenu from './AccountMenu'
import LoginForm from './LoginForm'
import NotificationIcon from './NotificationIcon'

class UpperRightUI extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    signInPage: PropTypes.bool,
    unreadNotificationsCount: PropTypes.number,
    openInviteLightbox: PropTypes.func,
    onClickAccount: PropTypes.func
  }

  static contextTypes = {
    location: PropTypes.object
  }

  render () {
    const { currentUser, signInPage, unreadNotificationsCount, openInviteLightbox, onClickAccount } = this.props
    return <div className="upperRightUI">
      {currentUser && <a href="/maps/new" target="_blank" className="addMap upperRightEl upperRightIcon">
        <div className="tooltipsUnder">
          Create New Map
        </div>
      </a>}
      {currentUser && <span id="notification_icon">
        <NotificationIcon unreadNotificationsCount={unreadNotificationsCount} />
      </span>}
      {!signInPage && <div className="sidebarAccount upperRightEl">
        <div className="sidebarAccountIcon" onClick={onClickAccount}>
          <div className="tooltipsUnder">Account</div>
          {currentUser && <img src={currentUser.get('image')} />}
          {!currentUser && 'SIGN IN'}
          {!currentUser && <div className="accountInnerArrow"></div>}
        </div>
        <div className="sidebarAccountBox upperRightBox">
          {currentUser
            ? <AccountMenu onInviteClick={openInviteLightbox} currentUser={currentUser} />
            : <LoginForm />}
        </div>
      </div>}
      <div className="clearfloat"></div>
    </div>
  }
}

export default UpperRightUI
