class MappingsController < ApplicationController
  
  before_filter :require_user, only: [:create, :update, :destroy]    
    
  respond_to :json
    
  # GET /mappings/1.json
  def show
    @mapping = Mapping.find(params[:id])

    render json: @mapping
  end

  # POST /mappings.json
  def create
    @mapping = Mapping.new(mapping_params)

    if @mapping.save
      render json: @mapping, status: :created
      @mapping.map.touch(:updated_at)
      Events::NewMapping.publish!(@mapping, current_user)
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # PUT /mappings/1.json
  def update
    @mapping = Mapping.find(params[:id])

    @mapping.map.touch(:updated_at)

    if @mapping.update_attributes(mapping_params)
      head :no_content
    else
      render json: @mapping.errors, status: :unprocessable_entity
    end
  end

  # DELETE /mappings/1.json
  def destroy
    @mapping = Mapping.find(params[:id])
    @map = @mapping.map

    @mapping.destroy

    @map.touch(:updated_at)

    head :no_content 
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def mapping_params
      params.require(:mapping).permit(:id, :category, :xloc, :yloc, :topic_id, :synapse_id, :map_id, :user_id)
    end
end
