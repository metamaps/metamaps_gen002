module Api
  module V1
    class MapSerializer < ApplicationSerializer
      attributes :id,
        :name,
        :desc,
        :permission,
        :screenshot,
        :created_at,
        :updated_at

      def self.embeddable
        {
          topics: {},
          synapses: {},
          mappings: {},
          contributors: { serializer: UserSerializer },
          collaborators: { serializer: UserSerializer }
        }
      end

      self.class_eval do
        embed_dat
      end
    end
  end
end
