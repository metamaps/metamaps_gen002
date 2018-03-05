import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
{ form_for @user, url: user_url, :html =>{ :multipart => true, :className => "edit_user centerGreyForm"} do |form| }
  <h3>Edit Settings</h3>
  <div className="userImage">
    <div className="userImageDiv" onclick="Metamaps.Account.toggleChangePicture()">
      { image_tag @user.image.url(:ninetysix), :size => "84x84" }
      <div className="editPhoto"></div>
    </div>
    <div className="userImageMenu">
      <div className="userMenuArrow"></div>
      <ul>
        <li className="upload">
          Upload Photo
          { hidden_field_tag "remove_image", "0" }
          { form.file_field :image }
          { form.label :image }
        </li>
        <li className="remove" onclick="Metamaps.Account.removePicture()">Remove</li>
        <li className="cancel" onclick="Metamaps.Account.closeChangePicture()">Cancel</li>
      </ul>
    </div>

  </div>
  <div className="accountName" onclick="Metamaps.Account.changeName()">
    <div className="nameEdit">{ @user.name }</div>
  </div>
  <div className="changeName">
    { form.label :name, "Name:", className: 'firstFieldText' }
    { form.text_field :name }
  </div>
  <div>
    { form.label :email, "Email:", className: 'firstFieldText' }
    { form.email_field :email }
  </div>
  <div>
    { form.label :emails_allowed, className: 'firstFieldText' do }
      { form.check_box :emails_allowed, className: 'inline' }
      Send Metamaps notifications to my email.
    { end }
    { fields_for :settings, @user.settings do |settings| }
      { settings.label :follow_topic_on_created, className: 'firstFieldText' do }
        { settings.check_box :follow_topic_on_created, className: 'inline'  }
        Auto-follow topics you create.
      { end }
      { settings.label :follow_topic_on_contributed, className: 'firstFieldText' do }
        { settings.check_box :follow_topic_on_contributed, className: 'inline'  }
        Auto-follow topics you edit.
      { end }
      { settings.label :follow_map_on_created, className: 'firstFieldText' do }
        { settings.check_box :follow_map_on_created, className: 'inline'  }
        Auto-follow maps you create.
      { end }
      { settings.label :follow_map_on_contributed, className: 'firstFieldText' do }
        { settings.check_box :follow_map_on_contributed, className: 'inline'  }
        Auto-follow maps you edit.
      { end }
    { end }
  </div>
  <div className="changePass" onclick="Metamaps.Account.showPass()">Change Password</div>
  <div className="toHide">
    <div>
      { form.label :current_password, "Current Password:", :className => "firstFieldText" }
      { password_field_tag :current_password, params[:current_password] }
    </div>
    <div>
      { form.label :password, "New Password:", :className => "firstFieldText" }
      { form.password_field :password, :autocomplete => :off}
    </div>
    <div>
      { form.label :password_confirmation, "Confirm New Password:", :className => "firstFieldText" }
      { form.password_field :password_confirmation, :autocomplete => :off}
    </div>
    <div className="noChangePass" onclick="Metamaps.Account.hidePass()">Oops, don't change password</div>
  </div>
  <div id="accountPageLoading"></div>
  { form.submit "Update", className: "update", onclick: "Metamaps.Account.showLoading()" }
  <div className="clearfloat"></div>
{ end }
</div>
    )
  }
}

export default MyComponent
