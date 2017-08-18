Game.interstellarUI = (function(){

	var instance = {};
	
	instance.entries = {};
    instance.commEntries = {};
    instance.commObservers = {};
	instance.rocketPartEntries = {};
    instance.rocketPartObservers = {};
    instance.rocketEntries = {};
    instance.rocketObservers = {};
    instance.antimatterEntries = {};
    instance.antimatterObservers = {};
    instance.starEntries = {};
    instance.starObservers = {};
    instance.titleTemplate = null;
    instance.machineTemplate = null;
    instance.navTemplate = null;

    instance.tabRoot = null;
    instance.navRoot = null;

    instance.tab = null;

    instance.categoryNames = {
        'starT1': "Tier 1 Stars",
        'starT2': "Tier 2 Stars",
        'starT3': "Tier 3 Stars",
        'starT4': "Tier 4 Stars"
    };

    instance.initialise = function() {
        if(Game.constants.enableInterstellar === false) {
            return;
        }

        this.tab = Game.ui.createTab({id: 'interstellarBeta', title: 'Interstellar (BETA)'});
        this.tab.initialise();

        instance.titleTemplate = Handlebars.compile(
            ['<tr><td colspan="2" style="border:none;">',
                '<h2 class="default btn-link">{{name}}</h2>',
                '<span>{{desc}}</span>',
                '<br><br>',
                '</td></tr>'].join('\n'));

        instance.factionTitleTemplate = Handlebars.compile(
            ['<tr><td colspan="2" style="border:none;">',
                '<h2 class="default btn-link">{{name}}</h2>',
                '<h4><b>Relationship: {{opinion}}</b></h4>',
                '<span>{{desc}}</span>',
                '<br><br>',
                '</td></tr>'].join('\n'));

        instance.commMachineTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}"></tr><td>',
                '<h3 class="default btn-link">{{name}}: <span id="{{htmlId}}Count">0</span></h3>',
                '<span>',
                    '<p>{{desc}}</p>',
                    '<p id="{{htmlId}}_cost"></p>',
                '</span>',
                '<div id="{{htmlId}}_buy" onclick="Game.interstellarBETA.comms.buildMachine(\'{{entryName}}\')" class="btn btn-default">Get {{name}}</div>',
                '</td></tr>'].join('\n'));

        instance.machineTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}"></tr><td style="border:none;">',
                '<h3 class="default btn-link">{{name}}: <span id="{{htmlId}}Count">0</span></h3>',
                '<span>',
                    '<p>{{desc}}</p>',
                    '<p id="{{htmlId}}_prod"></p>',
                    '<p id="{{htmlId}}_cost"></p>',
                '</span>',
                '<div id="{{htmlId}}_buy" onclick="Game.interstellarBETA.antimatter.buildMachine(\'{{entryName}}\')" class="btn btn-default">Get 1</div>',
                '<div id="{{htmlId}}_destroy" onclick="Game.interstellarBETA.antimatter.destroyMachine(\'{{entryName}}\')" class="btn btn-default">Destroy 1</div>',
                '</td></tr>'].join('\n'));

        instance.rocketTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}"></tr><td>',
                '<h3 class="default btn-link">{{name}}: <span id="{{htmlId}}Built">Not Built</span></h3>',
                '<span>',
                    '<p>{{desc}}</p>',
                    '<p id="{{htmlId}}_cost"></p>',
                '</span>',
                '<div id="{{htmlId}}_buy" onclick="Game.interstellarBETA.rocket.buildRocket(\'tier1Rocket\')" class="btn btn-default">Get {{name}}</div>',
                '</td></tr>'].join('\n'));

        instance.rocketPartTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}"></tr><td>',
                '<h3 class="default btn-link">{{name}}: <span id="{{htmlId}}Count">0</span>/{{max}}</h3>',
                '<span>',
                    '<p>{{desc}}</p>',
                    '<p id="{{htmlId}}_cost"></p>',
                '</span>',
                '<div id="{{htmlId}}_buy" onclick="Game.interstellarBETA.rocketParts.buildPart(\'{{entryName}}\', 1)" class="btn btn-default">Get {{name}}</div>',
                '<div id="{{htmlId}}_buy10" onclick="Game.interstellarBETA.rocketParts.buildPart(\'{{entryName}}\', 10)" class="btn btn-default">Buy 10</div>',
                '<div id="{{htmlId}}_buy{{max}}" onclick="Game.interstellarBETA.rocketParts.buildPart(\'{{entryName}}\', {{max}})" class="btn btn-default">Buy {{max}}</div>',
                '</td></tr>'].join('\n'));

        instance.starTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}" class="hidden"><td style="width:300px;">',
                '<h3 class="default btn-link" id="{{htmlId}}_name">{{name}}</h3>',
                '<h5>',
                    'Tier: {{tier}}<br>',
                    'Distance: {{distance}} (<span id="{{htmlId}}Cost">{{cost}}</span> Antimatter)<br>',
                    'Planets: {{planets}}<br>',
                '</h5>',
                '<div class="btn btn-default" id="{{htmlId}}_explore" onclick="Game.interstellarBETA.stars.exploreSystem(\'{{id}}\');">Explore</div>',
                '</td><td><br><br><br>',
                '<p>{{desc}}</p>',
                '</td></tr>'].join('\n'));

        instance.factionStarTemplate = Handlebars.compile(
            ['<tr id="{{htmlId}}_conquer" class="hidden"><td colspan="2">',
                '<h3 class="default btn-link" id="{{htmlId}}_name">{{name}}: <span id="{{htmlId}}_owned">Protected</span></h3>',
                '<h5>',
                    'Tier: {{tier}}<br>',
                    'Distance: {{distance}}<br>',
                    'Planets: {{planets}}<br>',
                    'Faction: {{faction}}<br>',
                    'Resources Present: {{resource1}}, {{resource2}}',
                '</h5><hide id="{{htmlId}}_conquerButtons">',
                    '<div class="btn btn-default" id="{{htmlId}}_invade" onclick="Game.interstellarBETA.stars.invadeSystem(\'{{id}}\');">Invade</div>',
                    '<div class="btn btn-default disabled" id="{{htmlId}}_absorb" onclick="Game.interstellarBETA.stars.absorbSystem(\'{{id}}\');">Absorb (10 Opinion)</div>',
                '</hide></td><td colspan="3"><br><br><br>',
                '<p>{{desc}}</p>',
                '</td></tr>'].join('\n'));

        instance.navTemplate = Handlebars.compile(
            ['<td style="vertical-align:middle;" colspan="3">',
                    '<span>{{name}}</span>',
                '</td>',].join('\n'));

        instance.rocketNavTemplate = Handlebars.compile(
            ['<td style="vertical-align:middle;" colspan="3">',
                    '<span>{{name}}</span>',
                '</td>',].join('\n'));

        instance.antimatterNavTemplate = Handlebars.compile(
            ['<td style="vertical-align:middle;">',
                    '<span>{{name}}</span>',
                '</td>',
                '<td style="vertical-align:middle; text-align:center;">',
                    '<span id="{{htmlId}}_perSecond">0</span>/Sec',
                '</td>',
                '<td style="vertical-align:middle; text-align:right;">',
                    '<span id="{{htmlId}}_current">0</span>',
                '</td>'].join('\n'));

        instance.factionNavTemplate = Handlebars.compile(
            ['<td style="vertical-align:middle;" colspan="2" class="{{hidden}}">',
                    '<div id="{{htmlId}}NavGlyph" class="glyphicon glyphicon-exclamation-sign hidden"></div>',
                    '<span>{{name}}</span>',
                '</td>',
                '<td style="vertical-align:middle; text-align:right;" colspan="1" class="{{hidden}}">',
                    '<span id="{{htmlId}}_opinion">{{opinion}}</span>',
                '</td>',].join('\n'));

        for(var id in Game.interstellarCategoryData){
            Game.interstellarBETA.categoryEntries[id] = Game.interstellarCategoryData[id];
        }

        for(var id in Game.interstellarBETA.categoryEntries) {
            this.tab.addCategory(id, Game.interstellarBETA.categoryEntries[id].title);
        }

        for(var id in Game.interstellarData) {
            this.createDisplay(id);
        }

    };

    instance.update = function(delta) {
        if(!Game.constants.enableInterstellar){
            return;
        }

        for(var id in this.commEntries) {
            var data = Game.interstellarBETA.comms.getMachineData(id);
            if(data.displayNeedsUpdate === true) {
                this.updateMachineDisplay(data);
            }
        }

        for(var id in this.rocketEntries) {
            var data = Game.interstellarBETA.rocket.getRocketData(id);
            if(data.displayNeedsUpdate === true) {
                this.updateRocketDisplay(data);
            }
        }

        for(var id in this.rocketPartEntries) {
            var data = Game.interstellarBETA.rocketParts.getPartData(id);
            if(data.displayNeedsUpdate === true) {
                this.updatePartDisplay(data);
            }
        }

        for(var id in this.antimatterEntries) {
            var data = Game.interstellarBETA.antimatter.getMachineData(id);
            if(data.displayNeedsUpdate === true) {
                this.updateMachineDisplay(data);
            }
        }

        // Updates Antimatter Nav
        $('#intnav_antimatter_current').text(Game.settings.format(antimatter));
        $('#intnav_antimatter_perSecond').text(antimatterps);
        if(antimatter >= 100000){
            document.getElementById("intnav_antimatter_current").className = "green";
        } else {
            document.getElementById("intnav_antimatter_current").className = "";
        }

        for(var id in Game.stargaze.entries){
            var data = Game.stargaze.getStargazeData(id);
            if(data.category == "faction"){
                $('#intnav_' + id + '_opinion').text(data.opinion);
            }
        }

        // Hides all faction tabs
        for(var id in Game.interstellarBETA.entries){
            var data = Game.interstellarBETA.getInterstellarData(id);
            if(data.category == "faction"){
                document.getElementById('tab_interstellarBeta_' + id + '_ne').className = "collapse_tab_interstellarBeta_faction hidden";
            }
        }

        for(var id in this.starEntries){
            var data = Game.interstellarBETA.stars.getStarData(id);
            if(data.explored){
                // Shows the faction tabs that have explored stars - relevant to previous for loop
                document.getElementById('tab_interstellarBeta_' + data.factionId + '_ne').className = "collapse_tab_interstellarBeta_faction";
                // Enables Absorb Button
                var faction = Game.stargaze.getStargazeData(data.factionId);
                if(faction.opinion >= 60){
                    document.getElementById('star_' + id + '_absorb').className = "btn btn-default";
                } else {
                    document.getElementById('star_' + id + '_absorb').className = "btn btn-default disabled";
                }
                //Update System Status
                if(data.owned){
                    $('#star_' + id + '_owned').text("Conquered");
                    document.getElementById('star_' + id + '_conquerButtons').className = "hidden";
                } else {
                    $('#star_' + id + '_owned').text("Protected");
                    document.getElementById('star_' + id + '_conquerButtons').className = "";
                }
                continue;
            }
            if(Game.interstellarBETA.comms.entries.IRS.count*5 >= data.distance){
                document.getElementById('star_' + id).className = "";
            }
            $('#star_' + id + 'Cost').text(Game.settings.format(data.distance*10000));
        }

        for(var id in this.antimatterEntries){
            for (var resource in this.antimatterEntries[id].resourcePerSecond){
                console.log(resource);
            }
        }

        // for(var id in Game.interstellarBETA.categoryEntries) {
        //     if(this.tab.categoryHasVisibleEntries(id) === true) {
        //         this.tab.showCategory(id);
        //     } else {
        //         this.tab.hideCategory(id);
        //     }
        // }
    };

    instance.createCommsMachine = function(data, machineData) {
        var tabContentRoot = $('#' + this.tab.getContentElementId(data.id));
        var part = this.commMachineTemplate(machineData);
        tabContentRoot.append($(part));

        this.commEntries[machineData.id] = data.id;
        this.commObservers[machineData.id] = [];
        Game.ui.bindElement("comm_" + machineData.entryName + "Count", function(){ return Game.settings.format(machineData.count); });
    };

    instance.createRocket = function(data, rocketData) {
        var tabContentRoot = $('#' + this.tab.getContentElementId(data.id));
        var rocket = this.rocketTemplate(rocketData);
        tabContentRoot.append($(rocket));
        this.rocketEntries[rocketData.id] = data.id;
        this.rocketObservers[rocketData.id] = [];
    };

    instance.createRocketPart = function(data, partData) {
        var tabContentRoot = $('#' + this.tab.getContentElementId(data.id));
        var part = this.rocketPartTemplate(partData);
        tabContentRoot.append($(part));

        this.rocketPartEntries[partData.id] = data.id;
        this.rocketPartObservers[partData.id] = [];
        Game.ui.bindElement("rocpart_" + partData.entryName + "Count", function(){ return Game.settings.format(partData.count); });
    };

    instance.createMachine = function(data, machineData) {
        var tabContentRoot = $('#' + this.tab.getContentElementId(data.id));
        var part = this.machineTemplate(machineData);
        tabContentRoot.append($(part));

        this.antimatterEntries[machineData.id] = data.id;
        this.antimatterObservers[machineData.id] = [];
        Game.ui.bindElement("antimatter_" + machineData.entryName + "Count", function(){ return Game.settings.format(machineData.count); });
    };

    instance.createStar = function(data, starData) {
        
        var star = this.starTemplate(starData);

        var tabContentRoot = $('#' + this.tab.getContentElementId(data.id));
        tabContentRoot.append($(star));

        this.starEntries[starData.id] = starData.id;
        this.starObservers[starData.id] = [];
    };

    instance.createFactionStar = function(data, starData) {
        
        var factionStar = this.factionStarTemplate(starData);

        var factionTabContentRoot = $('#' + this.tab.getContentElementId(starData.factionId));
        factionTabContentRoot.append($(factionStar));
    };

    instance.createCommsContent = function(data){
        var target = $('#' + this.tab.getContentElementId(data.id));
        var tabTitle = this.titleTemplate(data);
        target.append(tabTitle);

        for (var id in Game.interstellarBETA.comms.entries){
            var machineData = Game.interstellarBETA.comms.entries[id];
            this.createCommsMachine(data, machineData);
        }
    }

    instance.createRocketContent = function(data){
        var target = $('#' + this.tab.getContentElementId(data.id));
        var tabTitle = this.titleTemplate(data);
        target.append(tabTitle);

        for (var id in Game.interstellarBETA.rocket.entries){
            var rocketData = Game.interstellarBETA.rocket.entries[id];
            this.createRocket(data, rocketData);
        }
        for (var id in Game.interstellarBETA.rocketParts.entries){
            var partData = Game.interstellarBETA.rocketParts.entries[id];
            this.createRocketPart(data, partData);
        }
    }

    instance.createAntimatterContent = function(data){
        var target = $('#' + this.tab.getContentElementId(data.id));
        var tabTitle = this.titleTemplate(data);
        target.append(tabTitle);

        for (var id in Game.interstellarBETA.antimatter.entries){
            var machineData = Game.interstellarBETA.antimatter.entries[id];
            this.createMachine(data, machineData);
        }
    }

    instance.createTravelContent = function(data){
        var target = $('#' + this.tab.getContentElementId(data.id));
        var tabTitle = this.titleTemplate(data);
        target.append(tabTitle);

        for (var id in Game.interstellarBETA.stars.entries){
            var starData = Game.interstellarBETA.stars.entries[id];
            this.createStar(data, starData);
        }
    }

    instance.createFactionContent = function(data){
        var target = $('#' + this.tab.getContentElementId(data.id));
        var tabTitle = this.factionTitleTemplate(data);
        target.append(tabTitle);

        for (var id in Game.interstellarBETA.stars.entries){
            var starData = Game.interstellarBETA.stars.entries[id];
            if(starData.factionId == data.id){
                this.createFactionStar(data, starData);
            }
        }
    }

    instance.createInterstellarNav = function(data) {
        var target = $('#' + this.tab.getNavElementId(data.id));
        var html = this.navTemplate(data);
        if(data.id === "antimatter"){
            var html = this.antimatterNavTemplate(data);
            this.createAntimatterContent(data);
        }
        else if(data.id ==="rocket"){
            var html = this.rocketNavTemplate(data);
            this.createRocketContent(data);
        }
        else if(data.id ==="travel"){
            this.createTravelContent(data);
        }
        else if(data.category ==="faction"){
            var html = this.factionNavTemplate(data);
            this.createFactionContent(data);
        }
        else{
            this.createCommsContent(data);
        }
        target.append($(html));
    };

    instance.createDisplay = function(id) {
        var data = Game.interstellarBETA.getInterstellarData(id);
        this.tab.addNavEntry(data.category, id);

        
        this.createInterstellarNav(data);

        this.entries[data.htmlId] = data;
    };

    instance.updateMachineDisplay = function(data) {
        var element = $('#' + data.htmlId);
        if(data.unlocked === true) {
            element.show();
        } else {
            element.hide();
        }
        // Update the cost display
        if(data.cost) {
            var costDisplayData = this.buildCostDisplay(this.commObservers[data.id] || this.antimatterObservers[data.id], data);
            var costElement = $('#' + data.htmlId + '_cost');
            costElement.empty();
            costElement.append($(costDisplayData));
        }

        data.displayNeedsUpdate = false;
    };

    instance.updatePartDisplay = function(data) {
        var element = $('#' + data.htmlId);
        if(data.unlocked === true) {
            element.show();
        } else {
            element.hide();
        }
        // Update the cost display
        if(data.cost) {
            var costDisplayData = this.buildCostDisplay(this.rocketPartObservers[data.id], data);
            var costElement = $('#' + data.htmlId + '_cost');
            costElement.empty();
            costElement.append($(costDisplayData));
        }

        data.displayNeedsUpdate = false;
    };

    instance.updateRocketDisplay = function(data) {
        var element = $('#' + data.htmlId);
        if(data.unlocked === true) {
            element.show();
        } else {
            element.hide();
        }
        // Update the cost display
        if(data.built == true){
            console.log(document.getElementById('roc_' + data.id + 'Built'));
            var status = document.getElementById('roc_' + data.id + 'Built');
            status.innerHTML = "Built";
            status.className = "green";
            var costElement = $('#' + data.htmlId + '_cost');
            costElement.empty();
        } else {
            if(data.cost) {
                var costDisplayData = this.buildRocketCostDisplay(this.rocketObservers[data.id], data);
                var costElement = $('#' + data.htmlId + '_cost');
                costElement.empty();
                costElement.append($(costDisplayData));
            }
        }

        data.displayNeedsUpdate = false;
    };

    instance.buildCostDisplay = function(observerArray, data) {
        for(var i = 0; i < observerArray.length; i++) {
            observerArray[i].delete();
        }

        // Empty but keep the reference
        observerArray.length = 0;

        var segments = [];
        for(var id in data.cost) {
            var resourceData = Game.resources.getResourceData(id);
            if(!data) {
                console.error("Unknown Resource in cost: " + id);
                continue;
            }

            segments.push({i: id, h: data.htmlId + '_' + id + '_c', n: resourceData.name, c: data.cost[id]});
        }

        var resultHtml = '<span>Cost: </span>';
        for(var i = 0; i < segments.length; i++) {
            var segmentData = segments[i];
            resultHtml = resultHtml + '<span id="' + segmentData.h + '"></span> ';
            resultHtml = resultHtml + '<span> ' + segmentData.n + '</span>';
            if(i < segments.length - 1) {
                resultHtml = resultHtml + '<span>, </span>';
            }

            var observer = Game.ui.createResourceObserver({htmlId: segmentData.h, value: segmentData.c, res: segmentData.i, type: RESOURCE_OBSERVER_TYPE.SPECIFIC_VALUE});
            observerArray.push(observer);
        }

        return resultHtml;
    };

    instance.buildRocketCostDisplay = function(observerArray, data) {
        for(var i = 0; i < observerArray.length; i++) {
            observerArray[i].delete();
        }

        // Empty but keep the reference
        observerArray.length = 0;

        var segments = [];
        for(var id in data.cost) {
            var rocketPartData = Game.interstellarBETA.rocketParts.getPartData(id);
            if(!data) {
                console.error("Unknown Part in cost: " + id);
                continue;
            }

            segments.push({i: id, h: data.htmlId + '_' + id + '_c', n: rocketPartData.name, c: data.cost[id]});
        }

        var resultHtml = '<span>Cost: </span>';
        for(var i = 0; i < segments.length; i++) {
            var segmentData = segments[i];
            resultHtml = resultHtml + '<span id="' + segmentData.h + '">ERR</span> ';
            resultHtml = resultHtml + '<span> ' + segmentData.n + '</span>';
            if(i < segments.length - 1) {
                resultHtml = resultHtml + '<span>, </span>';
            }

            var observer = Game.ui.createResourceObserver({htmlId: segmentData.h, value: segmentData.c, res: segmentData.i, type: RESOURCE_OBSERVER_TYPE.SPECIFIC_VALUE});
            observerArray.push(observer);
        }

        return resultHtml;
    };

    

    Game.uiComponents.push(instance);

    return instance;

}());