require 'rails_helper'

# This spec was generated by rspec-rails when you ran the scaffold generator.
# It demonstrates how one might use RSpec to specify the controller code that
# was generated by Rails when you ran the scaffold generator.
#
# It assumes that the implementation code is generated by the rails scaffold
# generator.  If you are using any extension libraries to generate different
# controller code, this generated spec may or may not pass.
#
# It only uses APIs available in rails and/or rspec-rails.  There are a number
# of tools you can use to make these specs even more expressive, but we're
# sticking to rails and rspec-rails APIs to keep things simple and stable.
#
# Compared to earlier versions of this generator, there is very limited use of
# stubs and message expectations in this spec.  Stubs are only used when there
# is no simpler way to get a handle on the object needed for the example.
# Message expectations are only used when there is no simpler way to specify
# that an instance is receiving a specific message.

RSpec.describe MetacodesController, :type => :controller do
  before :each do
    @user = User.new(admin: true)
    sign_in @user
  end

  # This should return the minimal set of attributes required to create a valid
  # Metacode. As you add validations to Metacode, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) {
    skip("Add a hash of attributes valid for your model")
  }

  let(:invalid_attributes) {
    skip("Add a hash of attributes invalid for your model")
  }

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # MetacodesController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  describe "GET #index" do
    it "assigns all metacodes as @metacodes" do
      metacode = Metacode.create! valid_attributes
      get :index, {}, valid_session
      expect(assigns(:metacodes)).to eq([metacode])
    end
  end

  describe "GET #show" do
    it "assigns the requested metacode as @metacode" do
      metacode = Metacode.create! valid_attributes
      get :show, {:id => metacode.to_param}, valid_session
      expect(assigns(:metacode)).to eq(metacode)
    end
  end

  describe "GET #new" do
    it "assigns a new metacode as @metacode" do
      get :new, {}, valid_session
      expect(assigns(:metacode)).to be_a_new(Metacode)
    end
  end

  describe "GET #edit" do
    it "assigns the requested metacode as @metacode" do
      metacode = Metacode.create! valid_attributes
      get :edit, {:id => metacode.to_param}, valid_session
      expect(assigns(:metacode)).to eq(metacode)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Metacode" do
        expect {
          post :create, {:metacode => valid_attributes}, valid_session
        }.to change(Metacode, :count).by(1)
      end

      it "assigns a newly created metacode as @metacode" do
        post :create, {:metacode => valid_attributes}, valid_session
        expect(assigns(:metacode)).to be_a(Metacode)
        expect(assigns(:metacode)).to be_persisted
      end

      it "redirects to the created metacode" do
        post :create, {:metacode => valid_attributes}, valid_session
        expect(response).to redirect_to(Metacode.last)
      end
    end

    context "with invalid params" do
      it "assigns a newly created but unsaved metacode as @metacode" do
        post :create, {:metacode => invalid_attributes}, valid_session
        expect(assigns(:metacode)).to be_a_new(Metacode)
      end

      it "re-renders the 'new' template" do
        post :create, {:metacode => invalid_attributes}, valid_session
        expect(response).to render_template("new")
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        skip("Add a hash of attributes valid for your model")
      }

      it "updates the requested metacode" do
        metacode = Metacode.create! valid_attributes
        put :update, {:id => metacode.to_param, :metacode => new_attributes}, valid_session
        metacode.reload
        skip("Add assertions for updated state")
      end

      it "assigns the requested metacode as @metacode" do
        metacode = Metacode.create! valid_attributes
        put :update, {:id => metacode.to_param, :metacode => valid_attributes}, valid_session
        expect(assigns(:metacode)).to eq(metacode)
      end

      it "redirects to the metacode" do
        metacode = Metacode.create! valid_attributes
        put :update, {:id => metacode.to_param, :metacode => valid_attributes}, valid_session
        expect(response).to redirect_to(metacode)
      end
    end

    context "with invalid params" do
      it "assigns the metacode as @metacode" do
        metacode = Metacode.create! valid_attributes
        put :update, {:id => metacode.to_param, :metacode => invalid_attributes}, valid_session
        expect(assigns(:metacode)).to eq(metacode)
      end

      it "re-renders the 'edit' template" do
        metacode = Metacode.create! valid_attributes
        put :update, {:id => metacode.to_param, :metacode => invalid_attributes}, valid_session
        expect(response).to render_template("edit")
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested metacode" do
      metacode = Metacode.create! valid_attributes
      expect {
        delete :destroy, {:id => metacode.to_param}, valid_session
      }.to change(Metacode, :count).by(-1)
    end

    it "redirects to the metacodes list" do
      metacode = Metacode.create! valid_attributes
      delete :destroy, {:id => metacode.to_param}, valid_session
      expect(response).to redirect_to(metacodes_url)
    end
  end

end