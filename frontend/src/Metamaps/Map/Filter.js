/* global $ */

import _ from 'lodash'

import GlobalUI, { ReactApp } from '../GlobalUI'
import Settings from '../Settings'

const Filter = (map) => {
  const toExport = {
    dataForPresentation: {
      metacodes: {},
      mappers: {},
      synapses: {}
    },
    filters: {
      metacodes: [],
      mappers: [],
      synapses: []
    },
    visible: {
      metacodes: [],
      mappers: [],
      synapses: []
    },
    reset: function() {
      var self = toExport
      self.filters.metacodes = []
      self.filters.mappers = []
      self.filters.synapses = []
      self.visible.metacodes = []
      self.visible.mappers = []
      self.visible.synapses = []
      self.dataForPresentation.metacodes = {}
      self.dataForPresentation.mappers = {}
      self.dataForPresentation.synapses = {}
      ReactApp.render()
    },
    // an abstraction function for checkMetacodes, checkMappers, checkSynapses to reduce
    // code redundancy
    updateFilters: function(collection, propertyToCheck, correlatedModel, filtersToUse, listToModify) {
      var self = toExport
      var newList = []
      var removed = []
      var added = []
      // the first option enables us to accept
      // ['Topics', 'Synapses'] as 'collection'
      if (typeof collection === 'object') {
        map.DataModel[collection[0]].each(function(model) {
          var prop = model.get(propertyToCheck)
          if (prop !== null) {
            prop = prop.toString()
            if (newList.indexOf(prop) === -1) {
              newList.push(prop)
            }
          }
        })
        map.DataModel[collection[1]].each(function(model) {
          var prop = model.get(propertyToCheck)
          if (prop !== null) {
            prop = prop.toString()
            if (newList.indexOf(prop) === -1) {
              newList.push(prop)
            }
          }
        })
      } else if (typeof collection === 'string') {
        map.DataModel[collection].each(function(model) {
          var prop = model.get(propertyToCheck)
          if (prop !== null) {
            prop = prop.toString()
            if (newList.indexOf(prop) === -1) {
              newList.push(prop)
            }
          }
        })
      }
      removed = _.difference(self.filters[filtersToUse], newList)
      added = _.difference(newList, self.filters[filtersToUse])
      _.each(removed, function(identifier) {
        const index = self.visible[filtersToUse].indexOf(identifier)
        self.visible[filtersToUse].splice(index, 1)
        delete self.dataForPresentation[filtersToUse][identifier]
      })
      _.each(added, function(identifier) {
        const model = map.DataModel[correlatedModel].get(identifier) ||
        map.DataModel[correlatedModel].find(function(m) {
          return m.get(propertyToCheck) === identifier
        })
        self.dataForPresentation[filtersToUse][identifier] = model.prepareDataForFilter()
        self.visible[filtersToUse].push(identifier)
      })
      // update the list of filters with the new list we just generated
      self.filters[filtersToUse] = newList
      ReactApp.render()
    },
    checkMetacodes: function() {
      var self = toExport
      self.updateFilters('Topics', 'metacode_id', 'Metacodes', 'metacodes', 'metacode')
    },
    checkMappers: function() {
      var self = toExport
      if (map.Active.Map) {
        self.updateFilters('Mappings', 'user_id', 'Mappers', 'mappers', 'mapper')
      } else {
        // on topic view
        self.updateFilters(['Topics', 'Synapses'], 'user_id', 'Creators', 'mappers', 'mapper')
      }
    },
    checkSynapses: function() {
      var self = toExport
      self.updateFilters('Synapses', 'desc', 'Synapses', 'synapses', 'synapse')
    },
    filterAllMetacodes: function(toVisible) {
      var self = toExport
      self.visible.metacodes = toVisible ? self.filters.metacodes.slice() : []
      ReactApp.render()
      self.passFilters()
    },
    filterAllMappers: function(toVisible) {
      var self = toExport
      self.visible.mappers = toVisible ? self.filters.mappers.slice() : []
      ReactApp.render()
      self.passFilters()
    },
    filterAllSynapses: function(toVisible) {
      var self = toExport
      self.visible.synapses = toVisible ? self.filters.synapses.slice() : []
      ReactApp.render()
      self.passFilters()
    },
    // an abstraction function for toggleMetacode, toggleMapper, toggleSynapse
    // to reduce code redundancy
    // gets called in the context of a list item in a filter box
    toggleLi: function(whichToFilter, id) {
      var self = toExport
      if (self.visible[whichToFilter].indexOf(id) === -1) {
        self.visible[whichToFilter].push(id)
      } else {
        const index = self.visible[whichToFilter].indexOf(id)
        self.visible[whichToFilter].splice(index, 1)
      }
      ReactApp.render()
      self.passFilters()
    },
    toggleMetacode: function(id) {
      var self = toExport
      self.toggleLi('metacodes', id)
    },
    toggleMapper: function(id) {
      var self = toExport
      self.toggleLi('mappers', id)
    },
    toggleSynapse: function(id) {
      var self = toExport
      self.toggleLi('synapses', id)
    },
    passFilters: function() {
      var self = toExport
      var visible = self.visible

      var passesMetacode, passesMapper, passesSynapse

      var opacityForFilter = map.Active.Map ? 0 : 0.4

      map.DataModel.Topics.each(function(topic) {
        var n = topic.get('node')
        var metacodeId = topic.get('metacode_id').toString()

        if (visible.metacodes.indexOf(metacodeId) === -1) passesMetacode = false
        else passesMetacode = true

        if (map.Active.Map) {
          // when on a map,
          // we filter by mapper according to the person who added the
          // topic or synapse to the map
          let userId = topic.getMapping().get('user_id').toString()
          if (visible.mappers.indexOf(userId) === -1) passesMapper = false
          else passesMapper = true
        } else {
          // when on a topic view,
          // we filter by mapper according to the person who created the
          // topic or synapse
          let userId = topic.get('user_id').toString()
          if (visible.mappers.indexOf(userId) === -1) passesMapper = false
          else passesMapper = true
        }

        if (passesMetacode && passesMapper) {
          if (n) {
            n.setData('alpha', 1, 'end')
          } else {
            console.log(topic)
          }
        } else {
          if (n) {
            map.Control.deselectNode(n, true)
            n.setData('alpha', opacityForFilter, 'end')
            n.eachAdjacency(function(e) {
              map.Control.deselectEdge(e, true)
            })
          } else {
            console.log(topic)
          }
        }
      })

      // flag all the edges back to 'untouched'
      map.DataModel.Synapses.each(function(synapse) {
        var e = synapse.get('edge')
        e.setData('touched', false)
      })
      map.DataModel.Synapses.each(function(synapse) {
        var e = synapse.get('edge')
        var desc
        var userId = synapse.get('user_id').toString()

        if (e && !e.getData('touched')) {
          var synapses = e.getData('synapses')

          // if any of the synapses represent by the edge are still unfiltered
          // leave the edge visible
          passesSynapse = false
          for (let i = 0; i < synapses.length; i++) {
            desc = synapses[i].get('desc')
            if (visible.synapses.indexOf(desc) > -1) passesSynapse = true
          }

          // if the synapse description being displayed is now being
          // filtered, set the displayIndex to the first unfiltered synapse if there is one
          var displayIndex = e.getData('displayIndex') ? e.getData('displayIndex') : 0
          var displayedSynapse = synapses[displayIndex]
          desc = displayedSynapse.get('desc')
          if (passesSynapse && visible.synapses.indexOf(desc) === -1) {
            // iterate and find an unfiltered one
            for (let i = 0; i < synapses.length; i++) {
              desc = synapses[i].get('desc')
              if (visible.synapses.indexOf(desc) > -1) {
                e.setData('displayIndex', i)
                break
              }
            }
          }

          if (map.Active.Map) {
            // when on a map,
            // we filter by mapper according to the person who added the
            // topic or synapse to the map
            userId = synapse.getMapping().get('user_id').toString()
          }
          if (visible.mappers.indexOf(userId) === -1) passesMapper = false
          else passesMapper = true

          var color = Settings.colors.synapses.normal
          if (passesSynapse && passesMapper) {
            e.setData('alpha', 1, 'end')
            e.setData('color', color, 'end')
          } else {
            map.Control.deselectEdge(e, true)
            e.setData('alpha', opacityForFilter, 'end')
          }

          e.setData('touched', true)
        } else if (!e) {
          console.log(synapse)
        }
      })

      // run the animation
      map.Visualize.mGraph.fx.animate({
        modes: ['node-property:alpha',
          'edge-property:alpha'],
        duration: 200
      })
    }
  }
  return toExport
}

export default Filter
