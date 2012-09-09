/*  Author: Chi-chi Wang
    Sliding Puzzle Core Script
*/

$(document).ready( function() {

  "use strict";

  var menuTimer;
  function sizeFormat() {
    //reset values
    $('nav').css('margin-bottom', '0px');
    $('#content').css({'margin-bottom' : '0px', 'width' : 'auto' });
    $('#shadowLeft').css({ 'height' : '50px', 'left' : '0px', 'display' : 'block' });
    $('#shadowRight').css({ 'height' : '50px', 'left' : '0px', 'display' : 'block' });
    
    var winW = $(window).width(),
        pgwW = $('#page-wrap').width();
        
    //Layout: dynamic content block (variable-width page)
    //Max image width within content block = 500px (unless you make the image size dynamic)
    var addBM = $('#content').outerWidth(true) - $('#content').width();
    var newMarg = pgwW - $('nav').outerWidth(true) - addBM - 20;
    $('#content').css('width', (newMarg + 'px'));
    
    if ($('.cover').length) {
      $('#coverPicture').css({ 'width' : 'auto', 'height' : 'auto' })
    }
    
    //Layout: dynamic footer (variable-height page)
    if ($('nav').outerHeight() > $('#content').outerHeight()) {
      addBM = $('nav');
    }
    else {
      addBM = $('#content');
    }
    newMarg = $('header').outerHeight(true) + addBM.outerHeight();
    if (newMarg < $(window).height()) {
      newMarg += $('footer').outerHeight(true);
      newMarg = $('#page-wrap').outerHeight() - newMarg;
      if (newMarg >= 0)
        { addBM.css('margin-bottom', (newMarg + 'px')); }
    }
    
    //Layout: dynamic shadows (varible-width and variable-height page)
    winW = $(window).width(),
    pgwW = $('#page-wrap').width();
    
    if (winW > (pgwW + 30)) {
      addBM = ((winW - pgwW)/2) - 16;
      $('#shadowLeft').css({ 'left' : (addBM + 'px'), 'height' : $('#page-wrap').outerHeight(true) });
      addBM = winW - ((winW - pgwW)/2);
      $('#shadowRight').css({ 'left' : (addBM + 'px'), 'height' : $('#page-wrap').outerHeight(true) });
    }
    else {
      $('#shadowRight').css('display', 'none');
      $('#shadowLeft').css('display', 'none');
    }
    
  }
  
  function setPageMenu() {
    $('li.menuLink').each( function() {
                             $(this).css('background-position', '0px 31px')
                             if ($(this).children('a').length > 0)
                               { $(this).css('background-position', '0px 0px'); }
                           });
  }
  
  var container = {
    baseEl :     $('#fullImage'),
    controlEl:   $('#controlBox'),
    
  //start(cDown, cAcross);
  //cAcross = number of columns of tiles to be placed in the container
  //cDown   = number of rows of tiles to be placed in the container
  //This function initializes a container object and fills it with a grid of tiles (divs)
  //If passed no arguments, the grid dimensions default to 3x3
  //If passed one argument, the grid dimensions are both set to the argument
    start :
    function (cDown, cAcross) {
  
        if (arguments.length == 0) {                   //If no arguments specified
          cAcross = 3;                                 //Set default dimensions
          cDown = 3;
        }
        if (arguments.length == 1) {                   //If one argument specified
          cAcross = cDown;                             //Set to both dimensions
        }
    
      this.across = cAcross;                           //Initialize Object Properties
      this.down = cDown;
      this.length = cAcross * cDown;
      this.toggleBackImage(false);                     //Turn off the background image
      
      this.tileWidth = (this.baseEl.width() / cAcross) - 2;
      this.tileHeight = (this.baseEl.height() / cDown) - 2;
      this.moveCount = 0;
      
      var that = this;
      
      function gridSetup() {                                             //Function to set up the tilesArray, tile numbers and background
        function setupNumbers() {                                        //Function to apply numbers to all of the non-blank tiles
          $('.singleTile').each( function() {
                                 var theNum = parseInt($(this).attr('id').slice(4), 10),
                                     htmlStr = '<div class="numbered">' + theNum.toString() + '</div>';
                                 $(this).html(htmlStr);
                                 } );
          that.toggleNumbers($('.toggleNumbers').prop("checked"));
        }
        function setBlockImages() {                                      //Function to apply a background image to all non-blank tiles
          var setBackImage = 'url("' + that.backImage + '")';
          $('.singleTile').css('background-image', setBackImage);        //Add background image to all playable tiles
          if (that.baseEl.css('background-size')) {
            $('.singleTile').css('background-size', that.baseEl.css('background-size'))
          }
      
          for (i = 0; i < (that.length - 1); i++) {                      //Set background position of all playable tiles
            var tempPos = that.convertCoordinate(that.tilesArray[i].currentCoordinates);
            $('#' + that.getTileID(i+1)).css('background-position', (-1 * tempPos[1]) + 'px ' + (-1 * tempPos[0]) + 'px');
          }
        }
        console.log(that);  //-----DELETE----//
        that.tilesArray = new Array();
          for (var i = 0; i < that.down; i++) {                              //Set up current and winning coordinates
            for (var j = 0; j < that.across; j++) {                          //and the winCondition property
              that.tilesArray.push({ 'winCoordinates' : [i,j],
                                     'currentCoordinates' : [i,j],
                                     'winCondition' : true });
            }
          }
        setupNumbers();                                                  //Set up the tile numbers
        setBlockImages();                                                //Set up the background image
      }                                                                  //End function gridSetup()
      
        
      function divTemplate(idName, lastTile) {                 //Function to return a tile template to insert into container
        return $('<div>').attr('id',idName)
                         .addClass(lastTile ? 'blankTile' : 'singleTile')
                         .css({'width' : that.tileWidth,
                               'height' : that.tileHeight})
      }                                                        //End function divTemplate()
      
        
      this.baseEl.html('');                                                                        //Clear the contents of the container
      for (var i=1; i<=this.length; i++) {                                                             //Create each tile
        divTemplate(this.getTileID(i), (i == this.length)).appendTo($(this.baseEl));               //Add tile to container
      }
      $('#lowerControl .right').html('Moves Made: <span>' + this.moveCount + '</span>');
      gridSetup();
      this.shuffleTiles(8);
    },
  //cleanUp()
  //Deletes all object generated data so you can restart
  //the game with a clean slate
    cleanUp:
    function() {
      delete this.backImage;
      $('.toggleNumbers').unbind('click');
      $('a[href$="begin"]').unbind('click').html('&nbsp;Start Game&nbsp;');
      this.baseEl.css({ 'width'  : '', 'height' : '', 'background-size' : '' });
      $('.singleTile, .blankTile, .victory').remove();
    },
  //initImage(imageSource)
  //Initializes the basEl css property "background-image"
  //and sets it to the passed argument imageSource
  //Additionally it sets the width and height css properties of
  //the baseEl to the dimensions of the image passed
    initImage:
    function(imageSource) {
      if (typeof this.backImage === "string")
        { this.cleanUp(); }
      var setBackImage = "url('" + imageSource + "')";
      var that = this;
      this.baseEl.css("background-image", setBackImage);
      this.backImage = imageSource;
      
      var tempImage = new Image();
      tempImage.src = imageSource;
      $(tempImage).css({ 'opacity' : '0.0' , 'position' : 'fixed', 'top' : '-10000' }).insertAfter(this.controlEl);
      $(tempImage).load(function() {                                          //Image initialized - ready to go
                        if (that.maxGameWidth && ($(this).width() >= that.maxGameWidth)) {
                          $(this).width((that.maxGameWidth - 10) + 'px');
                          that.baseEl.css( { 'width'  : $(this).width(),
                                             'height' : $(this).height() } );
                          that.baseEl.css('background-size', ($(this).width() + 'px'));
                        }
                        else {
                        that.baseEl.css( { 'width'  : $(this).width(),
                                           'height' : $(this).height() } );
                        }
                        $(this).remove();
                        that.initControls();
                        });
    },
  //initControls()
  //Sets up the control box for the sliding tile puzzle
  //through which the user controls the settings of the game
    initControls:
    function(){
      var widthHeight = {'width' : this.baseEl.css('width'),
                         'height' : (parseInt(this.baseEl.css('height').slice(0,-2)) + 100 + 'px')},
          that = this;
      
      this.controlEl.css(widthHeight);
      $('#lowerControl .right').html('');
      sizeFormat();
      
      $('.toggleNumbers').click(function() {
                                that.toggleNumbers();
                                });
      $('a[href$="begin"]').click(function(event) {
                                  event.preventDefault();
                                  $('a[href$="begin"]').html('&nbsp;Restart Game&nbsp;');
                                  that.start($('.down').val(), $('.across').val());
                                  });
      
    },
  //setGameWidth(gameWidth)
  //Sets a variable that defines the maximum width
  //of the game image
    setGameWidth:
    function (gameWidth) {
      this.maxGameWidth = gameWidth;
    },
  //arraysEqual(array1, array2)
  //Returns true or false indicating
  //the equality of array1 and array2
    arraysEqual:
    function (array1, array2) {
      if ((array1 == null)||(array2 == null))
        return false;
      return !(array1 < array2 || array1 > array2);
    },
  //updateTilePosition(posInd[, animateMove])
  //Takes a tilesArray index value (posInd) and updates
  //the css so that the placement of the tile on the page
  //corresponds to the tilesArray currentCoordinates value
  //If a second argument, animateMove, is given, the
  //positional change will be animated over animateMove
  //milliseconds
    updateTilePosition:
    function (posInd, animateMove) {
      var posOffset = this.convertCoordinate(this.tilesArray[posInd].currentCoordinates),
          elID = '#' + this.getTileID(posInd+1);
      if(!animateMove) {
        $(elID).css({ 'top' : posOffset[0], 'left' : posOffset[1] });
      }
      else {
        $(elID).animate({ 'top' : posOffset[0], 'left' : posOffset[1] }, animateMove);
      }
    },
  //updateWinCondition(posInd)
  //Takes a tilesArray index value (posInd) and sets the winCondition
  //value based on the equality of the currentCoordinates array and the
  //winCoordinates array
    updateWinCondition:
    function(posInd) {
      var tilesArray = this.tilesArray[posInd];
      tilesArray.winCondition = this.arraysEqual(tilesArray.currentCoordinates, tilesArray.winCoordinates);
    },
  //convertCoordinate(gridArray)
  //Takes a positional coordinate [x,y] stored in gridArray
  //Returns an array [u,v] indicating the [top, left] coordinates
  //of the corresponding element
    convertCoordinate:
    function (posCoord) {
      return [((this.tileHeight+2) * posCoord[0]), ((this.tileWidth+2) * posCoord[1])];
    },
  //getTileID(num)
  //Takes in a numerical value and returns a string
  //in the html tagID format for the sliding puzzle
    getTileID:
    function (num) {
      return "tile" + (num < 10 ? "0" : "") + num.toString();
    },
  //isValidMove(aCoords, fCoords)
  //Takes two arrays, both [x, y] representing positions on the grid
  //Checks to see aCoord sits directly adjacent to fCoord (the free coordinate)
    isValidMove:
    function (aCoords, fCoords) {
      var truthiness = false,
          outOfBounds = (aCoords[0] >= this.down) ||            //The coordinates are out of bounds: true/false
                        (aCoords[0] < 0) ||
                        (aCoords[1] >= this.across) ||
                        (aCoords[1] <0),
          aTester = [[aCoords[0]-1, aCoords[1]],
                     [aCoords[0]+1, aCoords[1]],
                     [aCoords[0], aCoords[1]-1],
                     [aCoords[0], aCoords[1]+1]],
          test = this.arraysEqual;
      if (test(aCoords, fCoords) || outOfBounds)                //If aCoords IS fCoords (or out of bounds), move is invalid
        return truthiness;
      truthiness = truthiness || test(aTester[0], fCoords)      //Check for any valid moves from
                              || test(aTester[1], fCoords)      //aCoords to fCoords
                              || test(aTester[2], fCoords)
                              || test(aTester[3], fCoords);
      return truthiness;
    },
  //copyArray(copyFrom, copyTo)
  //Takes two arrays, copyFrom and copyTo
  //And sets the values of the second array
  //equal to the first
    copyArray:
    function (copyFrom, copyTo) {
      copyTo.length = copyFrom.length;
      for (var i = 0; i < copyFrom.length; i++)
        copyTo[i] = copyFrom[i];
    },
  //swapCurrentCoords(index1, index2)
  //Takes 2 indicies and swaps their currentCoordinates
  //values in the object's tilesArray
    swapCurrentCoords:
    function(index1, index2) {
      var TempCoords = new Array(),
          tilesArray = this.tilesArray;
      this.copyArray(tilesArray[index1].currentCoordinates, TempCoords);
      this.copyArray(tilesArray[index2].currentCoordinates, tilesArray[index1].currentCoordinates);
      this.copyArray(TempCoords, tilesArray[index2].currentCoordinates);
    },
  //shuffleTiles(numSets)
  //Shuffles the board by 100 random steps numSets amount of times
  //pausing for 150ms between shuffles.  On the final shuffle set
  //this function will bind the tiles to the click handler
    shuffleTiles:
    function (numSets) {
      numSets = numSets ? numSets : 1;
      var iterator = numSets-1,
          that = this;
          
      function updateAllTiles() {                  //Updates the position of every tile
        for ( var i = 0; i < that.length; i++) {
          that.updateTilePosition(i);
          that.updateWinCondition(i);
        }
      }
      
      for (var j = 0; j < 100; j++) {
        this.randomStep();
      }
      updateAllTiles();
        
      if (iterator > 0) {
        setTimeout ( function() {
                       that.shuffleTiles(iterator);
                     },
                     150);
      }
      if (iterator == 0) {                                                      //Final iteration
        $('.singleTile').off('click').on('click', {objRef : this}, this.tileClicked);        //Arm Click Event Handler on all tiles
      }
      
      
    },
  //randomStep()
  //Takes the object's tilesArray property
  //and makes a single, legal move on the board,
  //updating the tilesArray's currentCoordinates
  //properties
    randomStep:
    function () {
      var freeIndex = this.length - 1,
          newMove = [-1,-1],
          freePos = new Array();
      this.copyArray(this.tilesArray[freeIndex].currentCoordinates, freePos);
                     
        function randomFromTo(from, to) {                                     //generates a random integer between from and to
          return Math.floor(Math.random() * (to - from + 1) + from);
        }
      
        function getRandMove () {                                             //Returns the index of a random tile to swap with
          var matchPos = [freePos[0],freePos[1]];                             //the blank tile
          switch(randomFromTo(1,4))
           {
           case 1:
             matchPos[0] += 1;
             break;
           case 2:
             matchPos[1] +=1;
             break;
           case 3:
             matchPos[0] -= 1;
             break;
           case 4:
             matchPos[1] -= 1;
             break;
           };
           return [matchPos[0],matchPos[1]];
        }
        
        function matchPosition(coords) {                                        //Returns the numerical index, in tilesArray, of the tile
          for (var i = 0; i < this.length; i++) {                                   //whose currentCoordinates match the given coords variable
            if (this.arraysEqual(this.tilesArray[i].currentCoordinates, coords))
              return i;
          }
          return null;
        }
        
      while (!this.isValidMove(newMove, freePos))                    //Get a new, valid coordinate for the blank tile
        newMove = getRandMove();
      var newIndex = matchPosition.call(this, newMove);
      this.swapCurrentCoords(newIndex, freeIndex);
    },
  //tileClicked()
  //Event Handler for when a tile div is clicked
    tileClicked:
    function (event) {
      var that = event.data.objRef,
          clickedTileID = $(this).attr('id'),
          freeTileIndex = that.tilesArray.length - 1,
          clickedTileIndex = clickedTileID.slice(4) - 1,                   //Determine the array index of the element
          clickedTileObj = that.tilesArray[clickedTileIndex],              //Refers to the object in tilesArray of the clicked tile
          freeTileObj = that.tilesArray[freeTileIndex];                    //Refers to the object in tilesArray of the free tile
          
      function swapAndUpdateTiles(clicked, free) {                         //Switch the tiles out with each other
        that.swapCurrentCoords(clickedTileIndex, freeTileIndex);
        that.updateTilePosition(freeTileIndex);
        that.updateWinCondition(freeTileIndex);
        that.updateTilePosition(clickedTileIndex, 200);                    //Animate the clicked tile's move
        that.updateWinCondition(clickedTileIndex);
      }
      
      function boardVictory() {
        var truthiness = true;
        for ( var i = 0; i < that.tilesArray.length; i++) {
          truthiness = truthiness && that.tilesArray[i].winCondition;
        }
        return truthiness;
      }
      
      function victoryMet() {
        $('.singleTile').off('click');
        $('#controlBox').append('<div class="victory">You Win!</div>');
        $('.victory').css({ 'width' : '100%', 'text-align' : 'center', 'font-size' : '28px', 'font-weight' : 'bold' });
        $('a[href="begin"]').html('&nbsp;Play Again&nbsp;').off('click')
          .click(function(event) {
            event.preventDefault();
            $('.victory').remove();
            $('.singleTile, .blankTile').remove();
            $('a[href$="begin"]').html('&nbsp;Restart Game&nbsp;');
            that.start($('.down').val(), $('.across').val());
        });
        $('.singleTile').animate({'opacity' : '0.0'}, 1500, function(){
          that.toggleBackImage(true);
        });
      }
          
      if (that.isValidMove(clickedTileObj.currentCoordinates, freeTileObj.currentCoordinates)) {
        swapAndUpdateTiles(clickedTileIndex, freeTileIndex);
        that.moveCount++;
        $('#lowerControl .right span').html(that.moveCount);
        if (boardVictory()) {
          victoryMet();
        }
      }
    },
  //toggleNumbers([turnOn])
  //Toggles the display property of all divs of the class 'numbered'
  //If a true value is given, it turns all visibility on
  //If a false value is given, it turns all visibility off
    toggleNumbers:
    function(turnOn) {
      if (turnOn === undefined) {
        $('.numbered').toggle();
      }
      else if (turnOn == true) {
        $('.numbered').css('display', 'block');
      }
      else if (turnOn == false) {
        $('.numbered').css('display', 'none');
      }
    },
  //toggleBackImage([turnOn])
  //Toggles the css of the baseEl to turn the background-image property
  //On or Off.  If passed an argument turnOn, it will follow the true/false
  //value to turn the property on or off.
    toggleBackImage:
    function(turnOn) {
      var imageSrc = 'url("' + this.backImage + '")';
      if (turnOn === undefined) {
        if (this.baseEl.css("background-image") === "none")
          this.baseEl.css("background-image",imageSrc);
        else
          this.baseEl.css("background-image","");
      }
      else if (turnOn) {
        this.baseEl.css("background-image",imageSrc);
      }
      else if (!turnOn) {
        this.baseEl.css("background-image","");
      }
    }
    
    
  };
  
  $(window).unload(setPageMenu);
  $('#enableJS').remove();
  sizeFormat();
  $(window).load(function () {sizeFormat(); container.setGameWidth($('#content').width()); container.initImage('images/JStreetCats.jpg');}).resize(function () {sizeFormat(); container.setGameWidth($('#content').width());});
  setPageMenu();
  $('li.menuLink>a').hover(function() {
                             $('li.menuLink').css('background-position', '0px 0px');
                             $(this).parent('li').css('background-position', '0px 31px');
                             clearTimeout(menuTimer);
                           }, function() {
                             $(this).parent('li').css('background-position', '0px 0px');
                             menuTimer = setTimeout(setPageMenu,300);
                           });
  $('.urlSub').click(function(event) {
                        event.preventDefault();
                        $('#errorMsg').html('');
                        var tempImage = new Image();
                        tempImage.src = $('#imageURL').val();
                        $(tempImage).css({ 'opacity' : '0.0' , 'position' : 'fixed', 'top' : '-10000' }).insertAfter('#controlBox');
                        $(tempImage).load(function() {
                                            if (($(this).width() < 300) || ($(this).height() < 300)) {
                                              $('#errorMsg').html('Error: Image Size Too Small');
                                              $('#imageURL').val("");
                                              $(this).remove();
                                            }
                                            else {
                                              console.log('load entered');
                                              container.initImage(this.src);
                                              $('#imageURL').val("");
                                              $(this).remove();
                                            }
                                     }).error(function() {
                                            $('#errorMsg').html('Error: Invalid Image URL');
                                            $('#imageURL').val("");
                                     });
                                     });
  $('.puzzleImg').click(function (event) {
                          event.preventDefault();
                          var linkLoc = $(this).attr('href');
                          container.initImage(linkLoc);
                        });

  
});