# frozen_string_literal: true
class SynapsePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      visible = %w(public commons)
      return scope.where(permission: visible) unless user

      scope.where(permission: visible)
           .or(scope.where.not(defer_to_map_id: nil).where(defer_to_map_id: user.all_accessible_maps.map(&:id)))
           .or(scope.where(user_id: user.id))
    end
  end

  def index?
    true # really only for the API. should be policy scoped!
  end

  def create?
    topic1_show? && topic2_show? && user.present?
  end

  def show?
    topic1_show? && topic2_show? && synapse_show?
  end

  def update?
    if !user.present?
      false
    elsif record.defer_to_map.present?
      map_policy.update?
    else
      record.permission == 'commons' || record.user == user
    end
  end

  def destroy?
    record.user == user || admin_override
  end

  # Helpers

  def map_policy
    @map_policy ||= Pundit.policy(user, record.defer_to_map)
  end

  def topic1_show?
    @topic1_policy ||= Pundit.policy(user, record.topic1)
    @topic1_policy&.show?
  end

  def topic2_show?
    @topic2_policy ||= Pundit.policy(user, record.topic2)
    @topic2_policy&.show?
  end

  def synapse_show?
    if record.defer_to_map.present?
      map_policy&.show?
    else
      record.permission == 'commons' || record.permission == 'public' || record.user == user
    end
  end
end
