/*
 * @file
 * There is a lot of code that goes into creating the "label" of a node
 * This includes editable cards with all node details, and some controls
 * onCreateLabelHandler is the main function of this file, and the file
 * also contains a bunch of helper functions
 *
 * html and littleHTML are potentially confusing variables
 * html is the contents of the card shown when you click on a node's label.
 * littleHTML creates little controls for removing/hiding nodes from the canvas
 *
 * This function features PHP-style variable substitution because the strings 
 * are so damn long. Values are identified by $_id_$, and then a regular
 * expression is substituted in later (for html, in a separate function).
 */

function onCreateLabelHandler(domElement, node) {
  var html = generateShowcardHTML();
  html = replaceVariables(html, node);
  
  var showCard = document.createElement('div');
  showCard.className = 'showcard topic_' + node.id;
  showCard.innerHTML = html;
 showCard.style.display = "none";
  domElement.appendChild(showCard);

  // Create a 'name' button and add it to the main node label
  var nameContainer = document.createElement('span'),
  style = nameContainer.style;
  nameContainer.className = 'name topic_' + node.id;
  nameContainer.id = 'topic_' + node.id + '_label';

  nameContainer.innerHTML = generateLittleHTML (node);
  domElement.appendChild(nameContainer);
  style.fontSize = "0.9em";
  style.color = "#222222";

  bindCallbacks(showCard, nameContainer, node);
}

function generateShowcardHTML() {
  return '                                                                    \
  <div class="CardOnGraph"                                                    \
         id="topic_$_id_$">                                                   \
      <p class="type best_in_place best_in_place_metacode"                    \
         data-url="/topics/$_id_$"                                            \
         data-object="topic"                                                  \
         data-collection=$_metacode_choices_$                                 \
         data-attribute="metacode"                                            \
         data-type="select">$_metacode_$</p>                                  \
      <img alt="$_metacode_$"                                                 \
           class="icon"                                                       \
           title="Click to hide card"                                         \
           height="50"                                                        \
           width="50"                                                         \
           src="$_imgsrc_$" />                                                \
        <span class="title">                                                  \
          <span class="best_in_place best_in_place_name"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-attribute="name"                                         \
                data-type="input">$_name_$</span>                             \
          <a href="/topics/$_id_$" class="topic-go-arrow" target="_blank">    \
            <img class="topic-go-arrow"                                       \
                 title="Explore Topic"                                        \
                 src="/assets/go-arrow.png" />                                \
          </a>                                                                \
          <div class="clearfloat"></div>                                      \
        </span>                                                               \
        <div class="contributor">                                             \
          Added by: <a href="/users/$_userid_$" target="_blank">$_username_$  \
          </a>                                                                \
        </div>                                                                \
      <div class="scroll">                                                    \
        <div class="desc">                                                    \
          <span class="best_in_place best_in_place_desc"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-nil="$_desc_nil_$"                                       \
                data-attribute="desc"                                         \
                data-type="textarea">$_desc_$</span>                          \
                <div class="clearfloat"></div>                                \
        </div>                                                                \
      </div>                                                                  \
      <div class="link">                                                      \
      $_go_link_$                                                             \
      $_a_tag_$<span class="best_in_place best_in_place_link"                 \
            data-url="/topics/$_id_$"                                         \
            data-object="topic"                                               \
            data-attribute="link"                                             \
            data-type="input">$_link_$</span>$_close_a_tag_$                  \
      </div>                                                                  \
      <div class="clearfloat"></div>                                          \
    </div>';
}//generateShowcardHTML

function replaceVariables(html, node) {
  //link is rendered differently if user is logged out or in
  var go_link, a_tag, close_a_tag;
  if (userid == null) {
    go_link = '';
    if (node.getData("link") != "") {
      a_tag = '<a href="' + node.getData("link") + '">';
      close_a_tag = '</a>';
    }
    else {
      a_tag = '';
      close_a_tag = '';
    }
  } else {
    go_link = '<a href="' + node.getData("link") + '" ' +
              '   class="go-link" target="_blank">[go]</a>';
    a_tag = '';
    close_a_tag = '';
  }

  //create metacode_choices array from imgArray
  var metacodes = new Array();
  for (var key in imgArray) {
    if (imgArray.hasOwnProperty(key)) {
      if (key != node.getData("metacode")) {
        metacodes.push(key);
      }
    }
  }

  //Arrange it how we want it
  metacodes.sort();
  metacodes.unshift(node.getData("metacode"));

  var metacode_choices = "'[";
  for (var i in metacodes) {
    metacode_choices += '["' + metacodes[i] + '","' + metacodes[i] + '"],';
  }
  //remove trailing comma and add ]
  metacode_choices = metacode_choices.slice(0, -1);
  metacode_choices += "]'";

  var desc_nil = "<span class='gray'>Click to add description.</span>";
  var link_nil = "<span class='gray'>Click to add link.</span>";

  html = html.replace(/\$_id_\$/g, node.id);
  html = html.replace(/\$_metacode_\$/g, node.getData("metacode"));
  html = html.replace(/\$_imgsrc_\$/g, imgArray[node.getData("metacode")].src);
  html = html.replace(/\$_name_\$/g, node.name);
  html = html.replace(/\$_userid_\$/g, node.getData("userid"));
  html = html.replace(/\$_username_\$/g, node.getData("username"));
  html = html.replace(/\$_metacode_choices_\$/g, metacode_choices);
  html = html.replace(/\$_go_link_\$/g, go_link);
  html = html.replace(/\$_a_tag_\$/g, a_tag);
  html = html.replace(/\$_close_a_tag_\$/g, close_a_tag);
  if (node.getData("link") == "" && userid != null) {
    html = html.replace(/\$_link_\$/g, link_nil);
  } else {
    html = html.replace(/\$_link_\$/g, node.getData("link"));
  }

  html = html.replace(/\$_desc_nil_\$/g, desc_nil);
  if (node.getData("desc") == "" && userid != null) {
    //logged in but desc isn't there so it's invisible
    html = html.replace(/\$_desc_\$/g, desc_nil);
  } else {
    html = html.replace(/\$_desc_\$/g, node.getData("desc"));
  }
  return html;
}

function generateLittleHTML(node) {
  var littleHTML = '                                                          \
    <div class="label">$_name_$</div>                                         \
      <div class="nodeOptions">';

  if ((userid == null || mapid == null) && node.id != Mconsole.root) {
    //unauthenticated, not on a map: can remove from canvas
    littleHTML += '                                                           \
        <span class="removeFromCanvas"                                        \
              onclick="removeFromCanvas($_id_$)"                              \
              title="Click to remove topic from canvas">                      \
        </span>';
  } else if (mapid != null && userid != null && node.id != Mconsole.root) {
    //not on a map, authenticated, and not looking at root node
    //(you can't delete the root node of a JIT graph)
    littleHTML += '                                                           \
        <span class="removeFromCanvas"                                        \
                 onclick="removeFromCanvas($_id_$)"                           \
                 title="Click to remove topic from canvas">                   \
        </span>                                                               \
        <a href="/topics/$_mapid_$/$_id_$/removefrommap"                      \
           title="Click to remove topic from map"                             \
           class="removeFromMap"                                              \
           data-method="post"                                                 \
           data-remote="true"                                                 \
           rel="nofollow">                                                    \
        </a>';
  }

  if (userid != null && node.id != Mconsole.root) {
    //logged in, whether you're on a map or not
    littleHTML += '                                                           \
        <a href="/topics/$_id_$"                                              \
           title="Click to delete this topic"                                 \
           class="deleteTopic"                                                \
           data-confirm="Delete this topic and all synapses linking to it?"   \
           data-method="delete"                                               \
           data-remote="true"                                                 \
           rel="nofollow">                                                    \
        </a>';
  }
  littleHTML += '</div>';
  littleHTML = littleHTML.replace(/\$_id_\$/g, node.id);
  littleHTML = littleHTML.replace(/\$_mapid_\$/g, mapid);
  littleHTML = littleHTML.replace(/\$_name_\$/g, node.name);

  return littleHTML;
}

function hideCard(node) {
  var card = '.showcard';
  if (node != null) {
    card += '.topic_' + node.id;
  }

  $(card).fadeOut('fast', function(){
    node.setData('dim', 25, 'current');
    $('.name').show();
    Mconsole.plot();
  });
}

function bindCallbacks(showCard, nameContainer, node) {
   // add some events to the label
  $(showCard).find('img.icon').click(function(){
    hideCard(node);
  });

  $(showCard).find('.scroll').mCustomScrollbar(); 

  // add some events to the label
  $(nameContainer).find('.label').click(function(e){
    $('.showcard').css('display','none');
    $('.name').css('display','block');
    $('.name.topic_' + node.id).css('display','none');
    $('.showcard.topic_' + node.id).fadeIn('fast');
    selectNodeOnClickHandler(node,e);
    node.setData('dim', 1, 'current');
  });

  nameContainer.onmouseover = function(){
    $('.name.topic_' + node.id + ' .nodeOptions').css('display','block');
  }
 
  nameContainer.onmouseout = function(){
    $('.name.topic_' + node.id + ' .nodeOptions').css('display','none');
  }

  //bind best_in_place ajax callbacks
  $(showCard).find('.best_in_place_metacode').bind("ajax:success", function() {
    var metacode = $(this).html();
    //changing img alt, img src for top card (topic view page)
    //and on-canvas card. Also changing image of node
    $(showCard).find('img.icon').attr('alt', metacode);
    $(showCard).find('img.icon').attr('src', imgArray[metacode].src);
    node.setData("metacode", metacode);
    Mconsole.plot();
  });

  $(showCard).find('.best_in_place_name').bind("ajax:success", function() {
    var name = $(this).html();
    $(nameContainer).find('.label').html(name);
  });

  //available if you want it :)
  //$(showCard).find('.best_in_place_desc').bind("ajax:success", function() {
  //  var desc = $(this).html();
  //});

  $(showCard).find('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(showCard).find('.go-link').attr('href', link);
  });
}
