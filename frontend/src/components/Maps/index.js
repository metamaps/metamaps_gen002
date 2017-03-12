import React, { Component, PropTypes } from 'react'
import { throttle } from 'lodash'
import Header from './Header'
import MapperCard from './MapperCard'
import MapCard from './MapCard'

class Maps extends Component {

  static propTypes = {
    section: PropTypes.string,
    maps: PropTypes.object,
    juntoState: PropTypes.object,
    moreToLoad: PropTypes.bool,
    user: PropTypes.object,
    currentUser: PropTypes.object,
    loadMore: PropTypes.func,
    pending: PropTypes.bool,
    onStar: PropTypes.func,
    onRequest: PropTypes.func,
    onMapFollow: PropTypes.func,
    mapsWidth: PropTypes.number,
    mobile: PropTypes.bool
  }

  static contextTypes = {
    location: PropTypes.object
  }

  componentDidMount() {
    this.maps && this.maps.addEventListener('scroll', throttle(this.scroll, 500, { leading: true, trailing: false }))
  }

  scroll = () => {
    const { loadMore, moreToLoad, pending } = this.props
    const { maps } = this.refs
    if (moreToLoad && !pending && maps.scrollTop + maps.offsetHeight > maps.scrollHeight - 300) {
      loadMore()
    }
  }

  render = () => {
    const { mobile, maps, mapsWidth, currentUser, juntoState, pending, section, user, onStar, onRequest, onMapFollow } = this.props
    const style = { width: mapsWidth + 'px' }

    if (!maps) return null // do loading here instead

    return (
      <div>
        <div id='exploreMaps' ref={x => this.maps = x}>
          <div style={ style }>
            { user ? <MapperCard user={ user } /> : null }
            { currentUser && !user && !(pending && maps.length === 0) ? <div className="map newMap"><a href="/maps/new"><div className="newMapImage"></div><span>Create new map...</span></a></div> : null }
            { maps.models.map(map => <MapCard key={ map.id } map={ map } mobile={ mobile } juntoState={ juntoState } currentUser={ currentUser } onStar={ onStar } onRequest={ onRequest } onMapFollow={ onMapFollow } />) }
            <div className='clearfloat'></div>
          </div>
        </div>
        <Header signedIn={ !!currentUser }
          section={ section }
          user={ user }
          />
      </div>
    )
  }
}

export default Maps
