/** @jsx React.DOM */

var buttonStyle = {
  backgroundColor: '#cccccc',
  margin: 5,
  padding: 5,
  borderRadius: 5,
  width: 120
};

var Cell = React.createClass({
  shouldShowNumber: function () {
    if (this.props.showNumber === false) return false;
    if (this.props.showNumber === true) return true;
    return parseInt(this.props.contents, 2);
  },
  getBackgroundColor: function () {
    if (this.props.bgColor === 0) return "white";
    if (this.props.bgColor === 1) return "#AEC6CF";
    if (this.props.bgColor === 2) return "#FDFD96";
    if (this.props.bgColor === 3) return "#FFD1DC";
    return "white";
  },
  getHumanReadable: function () {
    if (this.shouldShowNumber()) return `(${parseInt(this.props.contents, 2)})`;
    if (this.props.showCode) {
      if (this.props.prevCode) {
        if (dissassemble(parseInt(this.props.prevCode, 2)).slice(0, 3) === "lis") {
          return parseInt(this.props.contents, 2).toString(10);
        }
      }
      return dissassemble(parseInt(this.props.contents, 2));
    }
    return "";
  },
  render: function () {

    return <pre
      onMouseDown={
        this.props.handleMouseDown
        ? this.props.handleMouseDown.bind(null, this.props.label)
        : function () {}
      }
      onMouseUp={
        this.props.handleMouseUp
        ? this.props.handleMouseUp.bind(null, this.props.label)
        : function () {}
      }
      onClick={
        this.props.handleClick
        ? this.props.handleClick.bind(null, this.props.label)
        : function () {}
      }
      style={{
        margin: 0,
        backgroundColor: this.getBackgroundColor(),
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
      >{this.props.label}:{this.props.contents} {this.getHumanReadable()}
    </pre>
  }
});

var StateView = React.createClass({
  getInitialState: function () {
    return {
      customColors: {},
      lockedCellRanges: []
    }
  },
  handleClick: function (clickedLabel) {
    clickedLabel = parseInt(clickedLabel, 10);
    var newCustomColors = JSON.parse(JSON.stringify(this.state.customColors));

    var newColor;

    if (!(newCustomColors[clickedLabel])) {
      newColor = 1;
    } else {
      newColor = (newCustomColors[clickedLabel] + 1) % 4
    }
    newCustomColors[clickedLabel] = newColor;

    this.state.lockedCellRanges.forEach(function (range) {
      var a = range[0];
      var b = range[1];

      if (a <= clickedLabel && clickedLabel < b) {
        // colour the range
        for (var i=a; i<b; i+=4) {
          newCustomColors[i] = newColor;
        }
      }
    });

    this.setState({
      customColors: newCustomColors
    });

  },
  handleMouseDown: function (mdLabel) {
    this.mdLabel = mdLabel;
  },
  handleMouseUp: function (muLabel) {
    var mdLabel = parseInt(this.mdLabel, 10);
    var muLabel = parseInt(muLabel, 10);
    var start = Math.min(mdLabel, muLabel);
    var end = Math.max(mdLabel, muLabel);
    if (end > start) {
      this.lockCells(start, end + 4);
    }
  },
  lockCells: function (start, end) {
    console.log("locking", start, end);
    this.setState({
      lockedCellRanges: this.state.lockedCellRanges.concat([[start, end]]),
    });
  },
  render: function () {

    var self = this;

    var registerView = <div style={{marginTop: 30}}>
      <Cell label="PC" contents={this.props.state.PC} showNumber={true} />

      {this.props.state.registers.map(function (contents, num) {
        return <Cell label={pad(num.toString(), 2, "0")} contents={contents} />
      })}

      <Cell label="LO" contents={this.props.state.LO} />
      <Cell label="HI" contents={this.props.state.HI} />
    </div>

    var MEMORY_MIDDLE = 16777208 / 2;

    var lowMemoryAddresses = Object.keys(this.props.state.memory).filter(function (address) {
      return (parseInt(address) <= MEMORY_MIDDLE / 2);
    });
    var highMemoryAddresses = Object.keys(this.props.state.memory).filter(function (address) {
      return (parseInt(address) > MEMORY_MIDDLE / 2);
    });

    var lowMemoryView = <div style={{marginTop: 30, width: 450}}>
      {lowMemoryAddresses.map(function (address) {
        if (address > 0) {
          var prevCode = self.props.state.memory[address-4];
        }
        return <Cell
          bgColor={self.state.customColors[parseInt(address, 10)]}
          handleClick={self.handleClick}
          label={pad(address, 8, " ")}
          contents={self.props.state.memory[address]}
          showNumber={false}
          showCode={true}
          prevCode={prevCode}
        />
      })}
    </div>

    var highMemoryView = <div style={{marginTop: 30, width: 450}}>
      {highMemoryAddresses.map(function (address) {
        return <Cell
          bgColor={self.state.customColors[parseInt(address, 10)]}
          handleClick={self.handleClick}
          handleMouseDown={self.handleMouseDown}
          handleMouseUp={self.handleMouseUp}
          label={pad(address, 8, " ")}
          contents={self.props.state.memory[address]} />
      })}
    </div>

    return <div>

      <pre>
      {this.state.lockedCellRanges.join('\n')}
      </pre>

      <div style={{
        display: 'flex',
        flexDirection: 'row'
      }}>

      {registerView}
      {highMemoryView}
      {lowMemoryView}

      </div>

    </div>
  }
});

var TraceViewer = React.createClass({
  getInitialState: function () {
    return {
      selectedTraceId: 0
    };
  },
  handleStepForward: function () {
    this.setState({
      selectedTraceId: this.state.selectedTraceId + 1,
    });
  },
  handleStepBackward: function () {
    this.setState({
      selectedTraceId: this.state.selectedTraceId - 1,
    });
  },
  render: function () {
    var selectedTrace = this.props.trace[this.state.selectedTraceId];
    return <div>
      <h3>Step {this.state.selectedTraceId}</h3>
      <button style={buttonStyle} onClick={this.handleStepBackward}>step backward</button>
      <button style={buttonStyle} onClick={this.handleStepForward}>step forward</button>
      {
        selectedTrace ? <StateView state={selectedTrace} /> : <div />
      }
    </div>
  }
});


var App = React.createClass({
  getInitialState: function () {
    return {
      trace: [],
      programLoaded: false,
    };
  },
  handleClickLoad: function () {

    node = $(React.findDOMNode(this)).find('#mcInput');
    var instructionString = node.val();

    var eis = executeInstructionString(instructionString);

    this.setState({
      trace: eis,
      programLoaded: true
    });

  },
  handleEditCode: function () {
    console.log('lol');
  },
  render: function() {
    return (
      <div>

        <pre style={{'whiteSpace': "pre"}}>
        Instructions: copy and paste some machine code into the box below and then click load (there is already some sample code in there)
        </pre>

        <input id="mcInput" onChange={this.handleEditCode} defaultValue="00000000000000001110000000010100, 00000000010000000000000000000000, 00000000000000000010000000010100, 00000000000000000000000000001000, 00000011110001001111000000100010, 00000011110000000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000001000, 10101100110001000000000000000000, 00000000000001100010100000100000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000011100, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000011100, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10101100110000000000000000010000, 10101100110000000000000000010100, 10101100110000000000000000011000, 10101100110111010000000000001000, 00000000000001101110100000100000, 10101111101111110000000000011000, 10101111101001010000000000001100, 00000000001000000001100000100000, 10101111101000110000000000010100, 00000000010000000001100000100000, 10101111101000110000000000010000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000010000, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000010000, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10001111101001000000000000010100, 10101100110001000000000000001000, 10001111101001000000000000010000, 10101100110001000000000000001100, 00000000000000000100000000010100, 00000000000000000000000011000100, 00000001000000000000000000001001, 10001111101111110000000000011000, 10001111101111010000000000001000, 00000011111000000000000000001000, 00000000000001100010100000100000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10101100110000000000000000010000, 10101100110000000000000000010100, 10101100110111010000000000001000, 00000000000001101110100000100000, 10101111101111110000000000010100, 10101111101001010000000000001100, 00000000000111010001100000100000, 10101111101000110000000000010000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 10101100110001000000000000000000, 10101100110000000000000000001000, 10001111101001000000000000010000, 10101100110001000000000000001000, 00000000000000000100000000010100, 00000000000000000000000111010100, 00000001000000000000000000001001, 10001111101111110000000000010100, 10001111101111010000000000001000, 00000011111000000000000000001000, 00000000000001100010100000100000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10101100110000000000000000010000, 10101100110000000000000000010100, 10101100110111010000000000001000, 00000000000001101110100000100000, 10101111101111110000000000010100, 10101111101001010000000000001100, 00000000000111010001100000100000, 10101111101000110000000000010000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 10101100110001000000000000000000, 10101100110000000000000000001000, 10001111101001000000000000010000, 10101100110001000000000000001000, 00000000000000000100000000010100, 00000000000000000000001001100000, 00000001000000000000000000001001, 10001111101111110000000000010100, 10001111101111010000000000001000, 00000011111000000000000000001000, 00000000000001100010100000100000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000011000, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10101100110000000000000000010000, 10101100110000000000000000010100, 10101100110111010000000000001000, 00000000000001101110100000100000, 10101111101111110000000000010100, 10101111101001010000000000001100, 10001111101001000000000000001100, 10001100100000110000000000001000, 10101111101000110000000000010000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000001100, 10101100110001000000000000000000, 10101100110000000000000000001000, 10001111101001000000000000010000, 10101100110001000000000000001000, 00000000000000000100000000010100, 00000000000000000000000101001100, 00000001000000000000000000001001, 10001111101111110000000000010100, 10001111101111010000000000001000, 00000011111000000000000000001000, 00000000000001100010100000100000, 00000000000111000011000000100000, 00000000000000000010000000010100, 00000000000000000000000000010100, 00000011100001001110000000100000, 00000000000000000010000000010100, 00000000000000000000000000010100, 10101100110001000000000000000000, 10101100110000000000000000001000, 10101100110000000000000000001100, 10101100110000000000000000010000, 10101100110111010000000000001000, 00000000000001101110100000100000, 10101111101111110000000000010000, 10101111101001010000000000001100, 00000000000111010010000000100000, 10001100100001000000000000001100, 10001100100001000000000000001000, 10001100100001000000000000001100, 10001100100001000000000000001000, 10001100100001000000000000001100, 10001100100000110000000000001000, 10001111101111110000000000010000, 10001111101111010000000000001000, 00000011111000000000000000001000
"></input>
        <button style={buttonStyle} onClick={this.handleClickLoad}>load</button>

        {
          this.state.programLoaded
            ? <TraceViewer trace={this.state.trace} />
            : null
        }


      </div>
    );
  }
});

React.render(<App />, document.body);