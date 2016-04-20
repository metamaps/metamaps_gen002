/* global Metamaps, Backbone, $ */

/*
 * Metamaps.Router.js.erb
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Famous
 *  - Metamaps.GlobalUI
 *  - Metamaps.JIT
 *  - Metamaps.Loading
 *  - Metamaps.Map
 *  - Metamaps.Maps
 *  - Metamaps.Topic
 *  - Metamaps.Views
 *  - Metamaps.Visualize
 */

;(function () {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'home', // #home
      'explore/:section': 'explore', // #explore/active
      'explore/:section/:id': 'explore', // #explore/mapper/1234
      'maps/:id': 'maps' // #maps/7
    },
    home: function () {
      clearTimeout(Metamaps.Router.timeoutId)

      if (Metamaps.Active.Mapper) document.title = 'Explore Active Maps | Metamaps'
      else document.title = 'Home | Metamaps'

      Metamaps.Router.currentSection = ''
      Metamaps.Router.currentPage = ''
      $('.wrapper').removeClass('mapPage topicPage')

      var classes = Metamaps.Active.Mapper ? 'homePage explorePage' : 'homePage'
      $('.wrapper').addClass(classes)

      var navigate = function () {
        Metamaps.Router.timeoutId = setTimeout(function () {
          Metamaps.Router.navigate('')
        }, 300)
      }
      // all this only for the logged in home page
      if (Metamaps.Active.Mapper) {
        Metamaps.Famous.yield.hide()

        Metamaps.Famous.explore.set('active')
        Metamaps.Famous.maps.resetScroll() // sets the scroll back to the top
        Metamaps.Famous.explore.show()

        Metamaps.Famous.maps.show()

        Metamaps.GlobalUI.Search.open()
        Metamaps.GlobalUI.Search.lock()

        Metamaps.Views.exploreMaps.setCollection(Metamaps.Maps.Active)
        if (Metamaps.Maps.Active.length === 0) {
          Metamaps.Maps.Active.getMaps(navigate) // this will trigger an explore maps render
        } else {
          Metamaps.Views.exploreMaps.render(navigate)
        }
      } else {
        // logged out home page
        Metamaps.Famous.yield.show()

        Metamaps.Famous.explore.hide()

        Metamaps.GlobalUI.Search.unlock()
        Metamaps.GlobalUI.Search.close(0, true)

        Metamaps.Famous.maps.hide()
        Metamaps.Router.timeoutId = setTimeout(navigate, 500)
      }

      Metamaps.Famous.viz.hide()
      Metamaps.Map.end()
      Metamaps.Topic.end()
      Metamaps.Active.Map = null
      Metamaps.Active.Topic = null
    },
    explore: function (section, id) {
      clearTimeout(Metamaps.Router.timeoutId)

      // just capitalize the variable section
      // either 'featured', 'mapper', or 'active'
      var capitalize = section.charAt(0).toUpperCase() + section.slice(1)

      if (section === 'featured' || section === 'active') {
        document.title = 'Explore ' + capitalize + ' Maps | Metamaps'
      } else if (section === 'mapper') {
        $.ajax({
          url: '/users/' + id + '.json',
          success: function (response) {
            document.title = response.name + ' | Metamaps'
          },
          error: function () {}
        })
      } else if (section === 'mine') {
        document.title = 'Explore My Maps | Metamaps'
      }

      $('.wrapper').removeClass('homePage mapPage topicPage')
      $('.wrapper').addClass('explorePage')

      Metamaps.Router.currentSection = 'explore'
      Metamaps.Router.currentPage = section

      // this will mean it's a mapper page being loaded
      if (id) {
        if (Metamaps.Maps.Mapper.mapperId !== id) {
          // empty the collection if we are trying to load the maps
          // collection of a different mapper than we had previously
          Metamaps.Maps.Mapper.reset()
          Metamaps.Maps.Mapper.page = 1
        }
        Metamaps.Maps.Mapper.mapperId = id
      }

      Metamaps.Views.exploreMaps.setCollection(Metamaps.Maps[capitalize])

      var navigate = function () {
        var path = '/explore/' + Metamaps.Router.currentPage

        // alter url if for mapper profile page
        if (Metamaps.Router.currentPage === 'mapper') {
          path += '/' + Metamaps.Maps.Mapper.mapperId
        }

        Metamaps.Router.navigate(path)
      }
      var navigateTimeout = function () {
        Metamaps.Router.timeoutId = setTimeout(navigate, 300)
      }
      if (Metamaps.Maps[capitalize].length === 0) {
        Metamaps.Loading.show()
        setTimeout(function () {
          Metamaps.Maps[capitalize].getMaps(navigate) // this will trigger an explore maps render
        }, 300) // wait 300 milliseconds till the other animations are done to do the fetch
      } else {
        if (id) {
          Metamaps.Views.exploreMaps.fetchUserThenRender(navigateTimeout)
        } else {
          Metamaps.Views.exploreMaps.render(navigateTimeout)
        }
      }

      Metamaps.GlobalUI.Search.open()
      Metamaps.GlobalUI.Search.lock()

      Metamaps.Famous.yield.hide()

      Metamaps.Famous.maps.resetScroll() // sets the scroll back to the top
      Metamaps.Famous.maps.show()
      Metamaps.Famous.explore.set(section, id)
      Metamaps.Famous.explore.show()

      Metamaps.Famous.viz.hide()
      Metamaps.Map.end()
      Metamaps.Topic.end()
      Metamaps.Active.Map = null
      Metamaps.Active.Topic = null
    },
    maps: function (id) {
      clearTimeout(Metamaps.Router.timeoutId)

      document.title = 'Map ' + id + ' | Metamaps'

      Metamaps.Router.currentSection = 'map'
      Metamaps.Router.currentPage = id

      $('.wrapper').removeClass('homePage explorePage topicPage')
      $('.wrapper').addClass('mapPage')
      // another class will be added to wrapper if you
      // can edit this map '.canEditMap'

      Metamaps.Famous.yield.hide()
      Metamaps.Famous.maps.hide()
      Metamaps.Famous.explore.hide()

      // clear the visualization, if there was one, before showing its div again
      if (Metamaps.Visualize.mGraph) {
        Metamaps.Visualize.mGraph.graph.empty()
        Metamaps.Visualize.mGraph.plot()
        Metamaps.JIT.centerMap(Metamaps.Visualize.mGraph.canvas)
      }
      Metamaps.Famous.viz.show()
      Metamaps.Topic.end()
      Metamaps.Active.Topic = null

      Metamaps.GlobalUI.Search.unlock()
      Metamaps.GlobalUI.Search.close(0, true)

      Metamaps.Loading.show()
      Metamaps.Map.end()
      Metamaps.Map.launch(id)
    },
    topics: function (id) {
      clearTimeout(Metamaps.Router.timeoutId)

      document.title = 'Topic ' + id + ' | Metamaps'

      Metamaps.Router.currentSection = 'topic'
      Metamaps.Router.currentPage = id

      $('.wrapper').removeClass('homePage explorePage mapPage')
      $('.wrapper').addClass('topicPage')

      Metamaps.Famous.yield.hide()
      Metamaps.Famous.maps.hide()
      Metamaps.Famous.explore.hide()

      // clear the visualization, if there was one, before showing its div again
      if (Metamaps.Visualize.mGraph) {
        Metamaps.Visualize.mGraph.graph.empty()
        Metamaps.Visualize.mGraph.plot()
        Metamaps.JIT.centerMap(Metamaps.Visualize.mGraph.canvas)
      }
      Metamaps.Famous.viz.show()
      Metamaps.Map.end()
      Metamaps.Active.Map = null

      Metamaps.GlobalUI.Search.unlock()
      Metamaps.GlobalUI.Search.close(0, true)

      Metamaps.Topic.end()
      Metamaps.Topic.launch(id)
    }
  })

  Metamaps.Router = new Router()
  Metamaps.Router.currentPage = ''
  Metamaps.Router.currentSection = undefined
  Metamaps.Router.timeoutId = undefined

  Metamaps.Router.intercept = function (evt) {
    var segments

    var href = {
      prop: $(this).prop('href'),
      attr: $(this).attr('href')
    }
    var root = window.location.protocol + '//' + window.location.host + Backbone.history.options.root

    if (href.prop && href.prop === root) href.attr = ''

    if (href.prop && href.prop.slice(0, root.length) === root) {
      evt.preventDefault()

      segments = href.attr.split('/')
      segments.splice(0, 1) // pop off the element created by the first /

      if (href.attr === '') {
        Metamaps.Router.home()
      } else {
        Metamaps.Router[segments[0]](segments[1], segments[2])
      }
    }
  }

  Metamaps.Router.init = function () {
    Backbone.history.start({
      silent: true,
      pushState: true,
      root: '/'
    })
    $(document).on('click', 'a:not([data-bypass])', Metamaps.Router.intercept)
  }
})()