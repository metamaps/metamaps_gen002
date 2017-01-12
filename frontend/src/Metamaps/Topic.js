/* global $ */

import $jit from '../patched/JIT'

import Active from './Active'
import AutoLayout from './AutoLayout'
import Create from './Create'
import DataModel from './DataModel'
import Engine from './Engine'
import Filter from './Filter'
import GlobalUI from './GlobalUI'
import JIT from './JIT'
import Map from './Map'
import Mouse from './Mouse'
import Router from './Router'
import Selected from './Selected'
import Settings from './Settings'
import Synapse from './Synapse'
import SynapseCard from './SynapseCard'
import TopicCard from './TopicCard'
import Util from './Util'
import Visualize from './Visualize'

const noOp = () => {}

const Topic = {
  // this function is to retrieve a topic JSON object from the database
  // @param id = the id of the topic to retrieve
  get: function(id, callback = noOp) {
    // if the desired topic is not yet in the local topic repository, fetch it
    if (DataModel.Topics.get(id) === undefined) {
      $.ajax({
        url: '/topics/' + id + '.json',
        success: function(data) {
          DataModel.Topics.add(data)
          callback(DataModel.Topics.get(id))
        }
      })
    } else callback(DataModel.Topics.get(id))
  },
  launch: function(id) {
    var start = function(data) {
      Active.Topic = new DataModel.Topic(data.topic)
      DataModel.Creators = new DataModel.MapperCollection(data.creators)
      DataModel.Topics = new DataModel.TopicCollection([data.topic].concat(data.relatives))
      DataModel.Synapses = new DataModel.SynapseCollection(data.synapses)
      DataModel.attachCollectionEvents()

      document.title = Active.Topic.get('name') + ' | Metamaps'

      // set filter mapper H3 text
      $('#filter_by_mapper h3').html('CREATORS')

      // build and render the visualization
      Visualize.type = 'RGraph'
      JIT.prepareVizData()

      // update filters
      Filter.reset()

      // reset selected arrays
      Selected.reset()

      // these three update the actual filter box with the right list items
      Filter.checkMetacodes()
      Filter.checkSynapses()
      Filter.checkMappers()

      // for mobile
      $('#header_content').html(Active.Topic.get('name'))
    }

    $.ajax({
      url: '/topics/' + id + '/network.json',
      success: start
    })
  },
  end: function() {
    if (Active.Topic) {
      $('.rightclickmenu').remove()
      TopicCard.hideCard()
      SynapseCard.hideCard()
      Filter.close()
    }
  },
  centerOn: function(nodeid, callback) {
    // don't clash with fetchRelatives
    if (!Visualize.mGraph.busy) {
      Visualize.mGraph.onClick(nodeid, {
        hideLabels: false,
        duration: 1000,
        onComplete: function() {
          if (callback) callback()
        }
      })
      Router.navigate('/topics/' + nodeid)
      Active.Topic = DataModel.Topics.get(nodeid)
    }
  },
  fetchRelatives: function(nodes, metacodeId) {
    var self = this

    var node = $.isArray(nodes) ? nodes[0] : nodes

    var topics = DataModel.Topics.map(function(t) { return t.id })
    var topicsString = topics.join()

    var creators = DataModel.Creators.map(function(t) { return t.id })
    var creatorsString = creators.join()

    var topic = node.getData('topic')

    var successCallback
    successCallback = function(data) {
      if (Visualize.mGraph.busy) {
        // don't clash with centerOn
        window.setTimeout(function() { successCallback(data) }, 100)
        return
      }
      if (data.creators.length > 0) DataModel.Creators.add(data.creators)
      if (data.topics.length > 0) DataModel.Topics.add(data.topics)
      if (data.synapses.length > 0) DataModel.Synapses.add(data.synapses)

      var topicColl = new DataModel.TopicCollection(data.topics)
      topicColl.add(topic)
      var synapseColl = new DataModel.SynapseCollection(data.synapses)

      var graph = JIT.convertModelsToJIT(topicColl, synapseColl)[0]
      Visualize.mGraph.op.sum(graph, {
        type: 'fade',
        duration: 500,
        hideLabels: false
      })

      var i, l, t, s

      Visualize.mGraph.graph.eachNode(function(n) {
        t = DataModel.Topics.get(n.id)
        t.set({ node: n }, { silent: true })
        t.updateNode()

        n.eachAdjacency(function(edge) {
          if (!edge.getData('init')) {
            edge.setData('init', true)

            l = edge.getData('synapseIDs').length
            for (i = 0; i < l; i++) {
              s = DataModel.Synapses.get(edge.getData('synapseIDs')[i])
              s.set({ edge: edge }, { silent: true })
              s.updateEdge()
            }
          }
        })
      })
      if ($.isArray(nodes) && nodes.length > 1) {
        self.fetchRelatives(nodes.slice(1), metacodeId)
      }
    }

    let paramsString = metacodeId ? 'metacode=' + metacodeId + '&' : ''
    paramsString += 'network=' + topicsString + '&creators=' + creatorsString

    $.ajax({
      type: 'GET',
      url: '/topics/' + topic.id + '/relatives.json?' + paramsString,
      success: successCallback,
      error: function() {}
    })
  },

  // opts is additional options in a hash
  // TODO: move createNewInDB and permitCreateSynapseAfter into opts
  renderTopic: function(mapping, topic, createNewInDB, permitCreateSynapseAfter, opts = {}) {
    var nodeOnViz
    var newnode = topic.createNode()
    const connectToId = Create.newSynapse.focusNode.getData('topic').id

    if (!$.isEmptyObject(Visualize.mGraph.graph.nodes)) {
      // this will also add the new node
      Visualize.mGraph.graph.addAdjacence(Create.newSynapse.focusNode, newnode)
      nodeOnViz = Visualize.mGraph.graph.getNode(newnode.id)
      Engine.addNode(nodeOnViz)
      Engine.addEdge(Visualize.mGraph.graph.getAdjacence(Create.newSynapse.focusNode.id, nodeOnViz.id))
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node
      Engine.setFocusNode(nodeOnViz)
      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
        nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
        Visualize.mGraph.fx.animate({
          modes: ['node-property:dim'],
          duration: 500
        })
    } else {
      Engine.run()
      Visualize.mGraph.loadJSON(newnode)
      nodeOnViz = Visualize.mGraph.graph.getNode(newnode.id)
      Engine.addNode(nodeOnViz)
      topic.set('node', nodeOnViz, {silent: true})
      topic.updateNode() // links the topic and the mapping to the node
      Engine.setFocusNode(nodeOnViz)
      nodeOnViz.setData('dim', 1, 'start')
      nodeOnViz.setData('dim', 25, 'end')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'current')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'start')
      nodeOnViz.setPos(new $jit.Complex(mapping.get('xloc'), mapping.get('yloc')), 'end')
      Visualize.mGraph.fx.plotNode(nodeOnViz, Visualize.mGraph.canvas)
      Visualize.mGraph.fx.animate({
        modes: ['node-property:dim'],
        duration: 500
      })
    }

    var mappingSuccessCallback = function(mappingModel, response, topicModel) {
      // call a success callback if provided
      if (opts.success) {
        opts.success(topicModel)
      }
    }
    var topicSuccessCallback = function(topicModel, response) {
      if (Active.Map) {
        mapping.save({ mappable_id: topicModel.id }, {
          success: function(model, response) {
            mappingSuccessCallback(model, response, topicModel)
          },
          error: function(model, response) {
            console.log('error saving mapping to database')
          }
        })
      }
      Synapse.createSynapseLocally(true, connectToId, topicModel.id)
    }

    if (!Settings.sandbox && createNewInDB) {
      if (topic.isNew()) {
        topic.save(null, {
          success: topicSuccessCallback,
          error: function(model, response) {
            console.log('error saving topic to database')
          }
        })
      } else if (!topic.isNew() && Active.Map) {
        mapping.save(null, {
          success: mappingSuccessCallback
        })
      }
    }
  },
  createTopicLocally: function() {
    var self = Topic

    if (Create.newTopic.name === '') {
      GlobalUI.notifyUser('Please enter a topic title...')
      return
    }

    $(document).trigger(Map.events.editedByActiveMapper)

    var metacode = DataModel.Metacodes.get(Create.newTopic.metacode)

    var topic = new DataModel.Topic({
      name: Create.newTopic.name,
      metacode_id: metacode.id,
      defer_to_map_id: Active.Map.id
    })
    DataModel.Topics.add(topic)

    var mapping = new DataModel.Mapping({
      xloc: Mouse.newNodeCoords.x, 
      yloc: Mouse.newNodeCoords.y,
      mappable_id: topic.cid,
      mappable_type: 'Topic'
    })
    DataModel.Mappings.add(mapping)

    // these can't happen until the value is retrieved, which happens in the line above
    Create.newTopic.reset()

    self.renderTopic(mapping, topic, true, true) // this function also includes the creation of the topic in the database
  },
  getTopicFromAutocomplete: function(id) {
    var self = Topic
    $(document).trigger(Map.events.editedByActiveMapper)
    Create.newTopic.reset()
    self.get(id, (topic) => {
      if (Create.newTopic.pinned) {
        var nextCoords = AutoLayout.getNextCoord({ mappings: DataModel.Mappings })
      }
      var mapping = new DataModel.Mapping({
        xloc: nextCoords ? nextCoords.x : Create.newTopic.x,
        yloc: nextCoords ? nextCoords.y : Create.newTopic.y,
        mappable_type: 'Topic',
        mappable_id: topic.id
      })
      DataModel.Mappings.add(mapping)
      self.renderTopic(mapping, topic, true, true)
    })
  },
  getMapFromAutocomplete: function(data) {
    var self = Topic

    $(document).trigger(Map.events.editedByActiveMapper)

    var metacode = DataModel.Metacodes.findWhere({ name: 'Metamap' })
    var topic = new DataModel.Topic({
      name: data.name,
      metacode_id: metacode.id,
      defer_to_map_id: Active.Map.id,
      link: window.location.origin + '/maps/' + data.id
    })
    DataModel.Topics.add(topic)

    var mapping = new DataModel.Mapping({
      xloc: Create.newTopic.x,
      yloc: Create.newTopic.y,
      mappable_id: topic.cid,
      mappable_type: 'Topic'
    })
    DataModel.Mappings.add(mapping)

    // these can't happen until the value is retrieved, which happens in the line above
    if (!Create.newTopic.pinned) Create.newTopic.hide()
    Create.newTopic.reset()

    self.renderTopic(mapping, topic, true, true) // this function also includes the creation of the topic in the database
    // this blocked the enterKeyHandler from creating a new topic as well
    if (Create.newTopic.pinned) Create.newTopic.beingCreated = true
  },
  getTopicFromSearch: function(event, id) {
    var self = Topic

    $(document).trigger(Map.events.editedByActiveMapper)

    self.get(id, (topic) => {
      var nextCoords = AutoLayout.getNextCoord({ mappings: DataModel.Mappings })
      var mapping = new DataModel.Mapping({
        xloc: nextCoords.x,
        yloc: nextCoords.y,
        mappable_type: 'Topic',
        mappable_id: topic.id
      })
      DataModel.Mappings.add(mapping)
      self.renderTopic(mapping, topic, true, true)
      GlobalUI.notifyUser('Topic was added to your map!')
    })

    event.stopPropagation()
    event.preventDefault()
    return false
  }
}

export default Topic
