# frozen_string_literal: true
class Map < ApplicationRecord
  belongs_to :user

  has_many :topicmappings, -> { Mapping.topicmapping }, class_name: :Mapping, dependent: :destroy
  has_many :synapsemappings, -> { Mapping.synapsemapping }, class_name: :Mapping, dependent: :destroy
  has_many :topics, through: :topicmappings, source: :mappable, source_type: 'Topic'
  has_many :synapses, through: :synapsemappings, source: :mappable, source_type: 'Synapse'
  has_many :messages, as: :resource, dependent: :destroy
  has_many :stars

  has_many :access_requests, dependent: :destroy
  has_many :user_maps, dependent: :destroy
  has_many :collaborators, through: :user_maps, source: :user

  has_many :webhooks, as: :hookable
  has_many :events, -> { includes :user }, as: :eventable, dependent: :destroy

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :screenshot,
    styles: {
      thumb: ['220x220#', :png]
      #:full => ['940x630#', :png]
    },
    default_url: 'https://s3.amazonaws.com/metamaps-assets/site/missing-map-square.png'

  validates :name, presence: true
  validates :arranged, inclusion: { in: [true, false] }
  validates :permission, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :screenshot, content_type: /\Aimage\/.*\Z/

  after_save :update_deferring_topics_and_synapses, if: :permission_changed?

  delegate :count, to: :topics, prefix: :topic # same as `def topic_count; topics.count; end`
  delegate :count, to: :synapses, prefix: :synapse
  delegate :count, to: :contributors, prefix: :contributor
  delegate :count, to: :stars, prefix: :star

  delegate :name, to: :user, prefix: true

  def mappings
    topicmappings.or(synapsemappings)
  end

  def contributors
    User.where(id: mappings.map(&:user_id).uniq)
  end

  def editors
    User.where(id: user_id).or(User.where(id: collaborators))
  end

  def user_image
    user.image.url(:thirtytwo)
  end

  def collaborator_ids
    collaborators.map(&:id)
  end

  def screenshot_url
    screenshot.url(:thumb)
  end

  def created_at_str
    created_at.strftime('%m/%d/%Y')
  end

  def updated_at_str
    updated_at.strftime('%m/%d/%Y')
  end

  def starred_by_user?(user)
    user&.stars&.where(map: self)&.exists? || false # return false, not nil
  end

  def as_json(_options = {})
    json = super(methods: [:user_name, :user_image, :star_count, :topic_count, :synapse_count, :contributor_count, :collaborator_ids, :screenshot_url], except: [:screenshot_content_type, :screenshot_file_size, :screenshot_file_name, :screenshot_updated_at])
    json[:created_at_clean] = created_at_str
    json[:updated_at_clean] = updated_at_str
    json
  end

  # user param helps determine what records are visible
  def contains(user)
    {
      map: self,
      topics: Pundit.policy_scope(user, topics).to_a,
      synapses: Pundit.policy_scope(user, synapses).to_a,
      mappings: Pundit.policy_scope(user, mappings).to_a,
      mappers: contributors,
      collaborators: editors,
      messages: messages.sort_by(&:created_at),
      stars: stars,
      requests: access_requests
    }
  end

  def add_new_collaborators(user_ids)
    users = User.where(id: user_ids)
    added = users.map do |new_user|
      next nil if editors.include?(new_user)
      UserMap.create(user_id: new_user.id, map_id: id)
      new_user.id
    end
    added.compact
  end

  def remove_old_collaborators(user_ids)
    removed = editors.map(&:id).map do |old_user_id|
      next nil if user_ids.include?(old_user_id)
      user_maps.where(user_id: old_user_id).find_each(&:destroy)
      access_requests.where(user_id: old_user_id).find_each(&:destroy)
      old_user_id
    end
    removed.compact
  end

  def update_deferring_topics_and_synapses
    Topic.where(defer_to_map_id: id).update_all(permission: permission)
    Synapse.where(defer_to_map_id: id).update_all(permission: permission)
  end
end
