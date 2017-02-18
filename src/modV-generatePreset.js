module.exports = function(modV) {
	
	modV.prototype.generatePreset = function(name) {
		let self = this;
		var preset = {
			layers: [],
			moduleData: {},
			MIDIAssignments: [],
			presetInfo: {
				name: name,
				datetime: Date.now(),
				modVVersion: this.version,
				author: this.options.user
			}
		};
		
		function extractValues(Control, Module, key) {
			if(Control instanceof self.PaletteControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'PaletteControl',
					variable: Control.variable,
					color: Module[Control.variable],
					colours: Control.colours,
					timePeriod: Control.timePeriod
				};

			} else if(Control instanceof self.VideoControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'VideoControl',
					variable: Control.variable,
					src: Module[Control.variable].src
				};

			} else if(Control instanceof self.ImageControl) {

				preset.moduleData[key].values[Control.variable] = {
					type: 'ImageControl',
					variable: Control.variable,
					src: Module[Control.variable].src
				};

			} else {

				if('append' in Control.getSettings()) {
					preset.moduleData[key].values[Control.variable] = Control.node.value;
				} else {
					preset.moduleData[key].values[Control.variable] = Module[Control.variable];
				}
			}
		}

		let MIDIAssignmentsObject = [];

		this.MIDIInstance.assignments.forEach((value, key) => {
			MIDIAssignmentsObject.push([key, value]);
		});

		preset.MIDIAssignments = MIDIAssignmentsObject;

		this.layers.forEach(Layer => {

			//TODO: create per-type copy methods, stringify/parse is probably slow. RESEARCH.

			let layerDetails = {
				clearing: 		JSON.parse(JSON.stringify(Layer.clearing)),
				alpha: 			JSON.parse(JSON.stringify(Layer.alpha)),
				enabled: 		JSON.parse(JSON.stringify(Layer.enabled)),
				inherit: 		JSON.parse(JSON.stringify(Layer.inherit)),
				pipeline: 		JSON.parse(JSON.stringify(Layer.pipeline)),
				blending: 		JSON.parse(JSON.stringify(Layer.blending)),
				name: 			JSON.parse(JSON.stringify(Layer.name)),
				moduleOrder: 	JSON.parse(JSON.stringify(Layer.moduleOrder))
			};

			preset.layers.push(layerDetails);
		});

		forIn(this.activeModules, (key, Module) => {
			
			preset.moduleData[key] = {};
			preset.moduleData[key].disabled = 			Module.info.disabled;
			preset.moduleData[key].blend = 				Module.info.blend || 'normal';
			preset.moduleData[key].name = 				Module.info.name;
			preset.moduleData[key].clone = 				false;
			preset.moduleData[key].originalName = 		Module.info.originalName;
			preset.moduleData[key].safeName = 			Module.info.safeName;
			preset.moduleData[key].originalModuleName = Module.info.originalModuleName;
			preset.moduleData[key].solo = 				Module.info.solo;
			preset.moduleData[key].alpha = 				Module.info.alpha;

			if('originalName' in Module.info) {
				preset.moduleData[key].clone = true;
			}

			preset.moduleData[key].values = {};
			forIn(Module.info.controls, (k, Control) => {
				extractValues(Control, Module, key);
			});
		});

		return preset;
	};
};