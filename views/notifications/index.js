import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className="centerContent notificationsPage">
    <header className="page-header">
      <h2 className="title">Notifications</h4>
    </header>
    <ul className="notifications">
      { blacklist = [MAP_ACCESS_REQUEST, MAP_ACCESS_APPROVED, MAP_INVITE_TO_EDIT] }
      { notifications = @notifications.to_a.delete_if{|n| blacklist.include?(n.notification_code) && (n.notified_object.nil? || n.notified_object.map.nil?) }}
      { notifications.each do |notification| }
        { receipt = @receipts.find_by(notification_id: notification.id) }
        <li className="notification { receipt.is_read? ? 'read' : 'unread' }" id="notification-{ notification.id }">
          { link_to notification_path(notification.id) do }
            <div className="notification-actor">
              { image_tag notification.sender.image(:thirtytwo) }
            </div>
            <div className="notification-body">
              <div className="in-bold">{ notification.sender.name }</div>
              {
                case notification.notification_code
                  when MAP_ACCESS_APPROVED }
                    { map = notification.notified_object.map }
                    granted your request to edit map <span className="in-bold">{ map.name }</span>
                  { when MAP_ACCESS_REQUEST }
                    { map = notification.notified_object.map }
                    wants permission to map with you on <span className="in-bold">{ map.name }</span>
                    { if !notification.notified_object.answered }
                      &nbsp;&nbsp;<div className="action">Offer a response</div>
                    { end }
                  { when MAP_INVITE_TO_EDIT }
                    { map = notification.notified_object.map }
                    gave you edit access to map  <span className="in-bold">{ map.name }</span>
                  { when TOPIC_ADDED_TO_MAP }
                    { topic = notification.notified_object.eventable
                    map = notification.notified_object.map }
                    added topic <span className="in-bold">{ topic.name }</span> to map <span className="in-bold">{ map.name }</span>
                  { when TOPIC_CONNECTED_1 }
                    { topic1 = notification.notified_object&.topic1 }
                    { topic2 = notification.notified_object&.topic2 }
                    connected <span className="in-bold">{ topic1&.name }</span> to <span className="in-bold">{ topic2&.name }</span>
                  { when TOPIC_CONNECTED_2 }
                    { topic1 = notification.notified_object&.topic1 }
                    { topic2 = notification.notified_object&.topic2 }
                    connected <span className="in-bold">{ topic2&.name }</span> to <span className="in-bold">{ topic1&.name }</span>
                  { when MESSAGE_FROM_DEVS }
                    { notification.subject }
              { end }
            </div>
          { end }
          <div className="notification-read-unread">
            { if receipt.is_read? }
              { link_to 'mark as unread', mark_unread_notification_path(notification.id), remote: true, method: :put }
            { else }
              { link_to 'mark as read', mark_read_notification_path(notification.id), remote: true, method: :put }
            { end }
          </div>
          <div className="notification-date">
            { notification.created_at.strftime("%b %d") }
          </div>
          <div className="clearfloat"></div>
        </li>
      { end }
      { if notifications.count == 0 }
        <div className="emptyInbox">
          You have no notifications. More time for dancing.
        </div>
      { end }
    </ul>
  </div>

  { if @notifications.total_pages > 1 }
    <div className="centerContent withPadding pagination">
      { paginate @notifications }
    </div>
  { end }
</div>
    )
  }
}

export default MyComponent
