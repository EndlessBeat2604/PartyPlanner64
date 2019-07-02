import * as React from "react";
import { BoardType, SpaceSubtype, Space, EventActivationType, EventParameterType, GameVersion } from "./types";
import { ISpace, addEventToSpace, removeEventFromSpace, getCurrentBoard, ISpaceEvent, IBoard } from "./boards";
import { $setting, get } from "./views/settings";
import { makeKeyClick } from "./utils/react";
import { IEvent, getAvailableEvents, IEventParameter, createSpaceEvent, getEvent } from "./events/events";
import { setEventParamDropHandler } from "./utils/drag";
import { copyObject } from "./utils/obj";
import { getImage } from "./images";
import { render, renderConnections, renderSpaces } from "./renderer";
import { showMessage, changeDecisionTree } from "./appControl";
import { createCustomEvent } from "./events/customevents";
import { getDistinctColor } from "./utils/colors";
import { Button } from "./controls";
import { $$log } from "./utils/debug";

interface ISpacePropertiesProps {
  boardType: BoardType;
  gameVersion: GameVersion;
  selectedSpaces: ISpace[] | null;
}

export class SpaceProperties extends React.Component<ISpacePropertiesProps> {
  state = { }

  onTypeChanged = (type: Space, subtype?: SpaceSubtype) => {
    const selectedSpaces = this.props.selectedSpaces!;
    for (const space of selectedSpaces) {
      if (type !== undefined) {
        space.type = type;
        if (space.rotation) {
          delete space.rotation;
        }
      }
      if (subtype !== undefined)
        space.subtype = subtype;
      else
        delete space.subtype;
    }
    render();
    this.forceUpdate();
  }

  onStarCheckChanged = (checked: boolean) => {
    const selectedSpaces = this.props.selectedSpaces!;
    for (const space of selectedSpaces) {
      space.star = !!checked;
    }
    render();
    this.forceUpdate();
  }

  onEventAdded = (event: IEvent) => {
    const space = this.props.selectedSpaces![0];
    const spaceEvent = createSpaceEvent(event);
    addEventToSpace(getCurrentBoard(), space, spaceEvent);
    render();
    this.forceUpdate();
  }

  onEventDeleted = (event: ISpaceEvent) => {
    const space = this.props.selectedSpaces![0];
    removeEventFromSpace(space, event);
    render();
    this.forceUpdate();
  }

  onEventActivationTypeToggle = (event: ISpaceEvent) => {
    if (event.activationType === EventActivationType.WALKOVER)
      event.activationType = EventActivationType.LANDON;
    else
      event.activationType = EventActivationType.WALKOVER;
  }

  onEventParameterSet = (event: ISpaceEvent, name: string, value: number) => {
    if (!event.parameterValues) {
      event.parameterValues = {};
    }
    event.parameterValues[name] = value;
    renderConnections();
    renderSpaces();
  }

  render() {
    const spaces = this.props.selectedSpaces;
    if (!spaces || !spaces.length) {
      return (
        <div className="propertiesEmptyText">No space selected.</div>
      );
    }

    const multipleSelections = spaces.length > 1;

    const curSpace = spaces[0];
    const gameVersion = this.props.gameVersion;
    const boardType = this.props.boardType;
    const isDuel = boardType === BoardType.DUEL;
    const spaceToggleTypes = _getSpaceTypeToggles(gameVersion, boardType);
    const spaceToggleSubTypes = _getSpaceSubTypeToggles(gameVersion, boardType);

    let eventsHeading = <SectionHeading text="Events" />;

    let currentType: Space | undefined = curSpace.type;
    let currentSubtype = curSpace.subtype;
    let hostsStarChecked = curSpace.star || false;
    let hostsStarIndeterminate = false;
    if (multipleSelections) {
      // Only show a type as selected if all spaces are the same.
      for (const space of spaces) {
        if (!space)
          continue;
        if (space.type !== currentType)
          currentType = undefined;
        if (space.subtype !== currentSubtype)
          currentSubtype = undefined;
        if (space.star !== hostsStarChecked)
          hostsStarIndeterminate = true;
      }
    }

    return (
      <div className="properties">
        <div className="propertiesPadded">
          {!multipleSelections ? <SpaceCoords space={curSpace} /> : null }
          <SpaceTypeToggle toggleTypes={spaceToggleTypes}
            type={currentType}
            subtype={currentSubtype}
            typeChanged={this.onTypeChanged} />
          <SpaceTypeToggle toggleTypes={spaceToggleSubTypes}
            type={currentType}
            subtype={currentSubtype}
            typeChanged={this.onTypeChanged} />
          {!isDuel ? <SpaceStarCheckbox checked={hostsStarChecked}
            indeterminate={hostsStarIndeterminate}
            onStarCheckChanged={this.onStarCheckChanged} /> : null }
          <SpaceDecisionTreeButton space={curSpace} />
        </div>
        {!multipleSelections ? eventsHeading : null }
        {!multipleSelections ? (
        <div className="propertiesPadded">
          <SpaceEventsList events={curSpace.events}
            board={getCurrentBoard()}
            onEventAdded={this.onEventAdded} onEventDeleted={this.onEventDeleted}
            onEventActivationTypeToggle={this.onEventActivationTypeToggle}
            onEventParameterSet={this.onEventParameterSet} />
        </div>
        ) : null }
      </div>
    );
  }
};

interface ISectionHeadingProps {
  text: string;
}

function SectionHeading(props: ISectionHeadingProps) {
  return (
    <span className="propertySectionTitle">
      {props.text}
    </span>
  );
}

interface ISpaceCoordsProps {
  space: ISpace;
}

class SpaceCoords extends React.Component<ISpaceCoordsProps, any> {
  state: any = {}

  onChangeX = (event: any) => {
    var newX = parseInt(event.target.value, 10);
    var isBlank = event.target.value === "";
    var curBgWidth = getCurrentBoard().bg.width;
    if ((!isBlank && isNaN(newX)) || newX < 0 || newX > curBgWidth)
      return;
    if (!this.state.oldX)
      this.setState({ oldX: this.props.space.x });
    (this as any).props.space.x = isBlank ? "" : newX;
    this.forceUpdate();
  }

  onChangeY = (event: any) => {
    let newY = parseInt(event.target.value, 10);
    let isBlank = event.target.value === "";
    let curBgHeight = getCurrentBoard().bg.height;
    if ((!isBlank && isNaN(newY)) || newY < 0 || newY > curBgHeight)
      return;
    if (!this.state.oldY)
      this.setState({ oldY: this.props.space.y });
    (this as any).props.space.y = isBlank ? "" : newY;
    this.forceUpdate();
  }

  onChangeRotation = (event: any) => {
    let newRot = parseInt(event.target.value, 10);
    let isBlank = event.target.value === "";
    if ((!isBlank && isNaN(newRot)) || newRot < 0 || newRot > 360)
      return;
    if (!this.state.oldRot)
      this.setState({ oldRot: this.props.space.rotation });
    if (!newRot)
      delete this.props.space.rotation;
    else
      this.props.space.rotation = newRot;
    this.forceUpdate();
  }

  onCoordSet = () => {
    this.props.space.x = this.props.space.x || 0;
    this.props.space.y = this.props.space.y || 0;
    render();
    this.setState({ oldX: undefined, oldY: undefined, oldRot: undefined });
    this.forceUpdate();
  }

  onKeyUp = (event: any) => {
    if (event.key === "Enter")
      this.onCoordSet();
  }

  render() {
    let space = this.props.space;
    if (!space)
      return null;

    const isArrow = space.type === Space.ARROW;

    return (
      <React.Fragment>
        <div className="spaceCoordRow">
          <span className="coordLabel">X:</span>
          <input className="coordInput" type="text" value={space.x} onChange={this.onChangeX}
            onBlur={this.onCoordSet} onKeyUp={this.onKeyUp} />
          <span className="coordLabel">Y:</span>
          <input className="coordInput" type="text" value={space.y} onChange={this.onChangeY}
            onBlur={this.onCoordSet} onKeyUp={this.onKeyUp} />
        </div>
        {/* {isArrow &&
          <div className="spaceCoordRow">
            <span className="coordLabel">Rotation:</span>
              <input className="coordInput" type="text" value={space.rotation} onChange={this.onChangeRotation}
                onBlur={this.onCoordSet} onKeyUp={this.onKeyUp} />
          </div>
        } */}
      </React.Fragment>
    );
  }
};

interface SpaceTypeToggleItem {
  name: string;
  icon: string;
  type?: Space
  subtype?: SpaceSubtype;
  advanced?: boolean;
}

const SpaceTypeToggleTypes_1: SpaceTypeToggleItem[] = [
  // Types
  { name: "Change to blue space", icon: "img/toolbar/blue.png", type: Space.BLUE },
  { name: "Change to red space", icon: "img/toolbar/red.png", type: Space.RED },
  { name: "Change to happening space", icon: "img/toolbar/happening.png", type: Space.HAPPENING },
  { name: "Change to chance time space", icon: "img/toolbar/chance.png", type: Space.CHANCE },
  { name: "Change to Mini-Game space", icon: "img/toolbar/minigame.png", type: Space.MINIGAME },
  { name: "Change to shroom space", icon: "img/toolbar/shroom.png", type: Space.SHROOM },
  { name: "Change to Bowser space", icon: "img/toolbar/bowser.png", type: Space.BOWSER },
  { name: "Change to invisible space", icon: "img/toolbar/other.png", type: Space.OTHER },
  { name: "Change to star space", icon: "img/toolbar/star.png", type: Space.STAR, advanced: true },
  { name: "Change to start space", icon: "img/toolbar/start.png", type: Space.START, advanced: true },
];
const SpaceSubTypeToggleTypes_1: SpaceTypeToggleItem[] = [
  // Subtypes
  { name: "Show Toad", icon: "img/toolbar/toad.png", subtype: SpaceSubtype.TOAD },
  { name: "Show Boo", icon: "img/toolbar/boo.png", subtype: SpaceSubtype.BOO },
  { name: "Show Bowser", icon: "img/toolbar/bowsercharacter.png", subtype: SpaceSubtype.BOWSER },
  { name: "Show Koopa Troopa", icon: "img/toolbar/koopa.png", subtype: SpaceSubtype.KOOPA },
];

const SpaceTypeToggleTypes_2: SpaceTypeToggleItem[] = [
  // Types
  { name: "Change to blue space", icon: "img/toolbar/blue.png", type: Space.BLUE },
  { name: "Change to red space", icon: "img/toolbar/red.png", type: Space.RED },
  { name: "Change to happening space", icon: "img/toolbar/happening.png", type: Space.HAPPENING },
  { name: "Change to chance time space", icon: "img/toolbar/chance2.png", type: Space.CHANCE },
  { name: "Change to Bowser space", icon: "img/toolbar/bowser.png", type: Space.BOWSER },
  { name: "Change to item space", icon: "img/toolbar/item.png", type: Space.ITEM },
  { name: "Change to battle space", icon: "img/toolbar/battle.png", type: Space.BATTLE },
  { name: "Change to bank space", icon: "img/toolbar/bank.png", type: Space.BANK },
  { name: "Change to invisible space", icon: "img/toolbar/other.png", type: Space.OTHER },
  { name: "Change to star space", icon: "img/toolbar/star.png", type: Space.STAR, advanced: true },
  { name: "Change to black star space", icon: "img/toolbar/blackstar.png", type: Space.BLACKSTAR, advanced: true },
  { name: "Change to start space", icon: "img/toolbar/start.png", type: Space.START, advanced: true },
  { name: "Change to arrow space", icon: "img/toolbar/arrow.png", type: Space.ARROW, advanced: true },
];
const SpaceSubTypeToggleTypes_2: SpaceTypeToggleItem[] = [
  // Subtypes
  { name: "Show Toad", icon: "img/toolbar/toad.png", subtype: SpaceSubtype.TOAD },
  { name: "Show Boo", icon: "img/toolbar/boo.png", subtype: SpaceSubtype.BOO },
  { name: "Show bank", icon: "img/toolbar/banksubtype2.png", subtype: SpaceSubtype.BANK },
  { name: "Show bank coin stack", icon: "img/toolbar/bankcoinsubtype.png", subtype: SpaceSubtype.BANKCOIN },
  { name: "Show item shop", icon: "img/toolbar/itemshopsubtype2.png", subtype: SpaceSubtype.ITEMSHOP },
];

const SpaceTypeToggleTypes_3: SpaceTypeToggleItem[] = [
  // Types
  { name: "Change to blue space", icon: "img/toolbar/blue3.png", type: Space.BLUE },
  { name: "Change to red space", icon: "img/toolbar/red3.png", type: Space.RED },
  { name: "Change to happening space", icon: "img/toolbar/happening3.png", type: Space.HAPPENING },
  { name: "Change to chance time space", icon: "img/toolbar/chance3.png", type: Space.CHANCE },
  { name: "Change to Bowser space", icon: "img/toolbar/bowser3.png", type: Space.BOWSER },
  { name: "Change to item space", icon: "img/toolbar/item3.png", type: Space.ITEM },
  { name: "Change to battle space", icon: "img/toolbar/battle3.png", type: Space.BATTLE },
  { name: "Change to bank space", icon: "img/toolbar/bank3.png", type: Space.BANK },
  { name: "Change to Game Guy space", icon: "img/toolbar/gameguy.png", type: Space.GAMEGUY },
  { name: "Change to invisible space", icon: "img/toolbar/other.png", type: Space.OTHER },
  { name: "Change to star space", icon: "img/toolbar/star.png", type: Space.STAR, advanced: true },
  { name: "Change to start space", icon: "img/toolbar/start.png", type: Space.START, advanced: true },
  { name: "Change to arrow space", icon: "img/toolbar/arrow.png", type: Space.ARROW, advanced: true },
];
const SpaceSubTypeToggleTypes_3: SpaceTypeToggleItem[] = [
  // Subtypes
  { name: "Show Millenium Star", icon: "img/toolbar/mstar.png", subtype: SpaceSubtype.TOAD },
  { name: "Show Boo", icon: "img/toolbar/boo.png", subtype: SpaceSubtype.BOO },
  { name: "Show bank", icon: "img/toolbar/banksubtype.png", subtype: SpaceSubtype.BANK },
  { name: "Show bank coin stack", icon: "img/toolbar/bankcoinsubtype.png", subtype: SpaceSubtype.BANKCOIN },
  { name: "Show item shop", icon: "img/toolbar/itemshopsubtype.png", subtype: SpaceSubtype.ITEMSHOP },
];

const SpaceTypeToggleTypes_3_Duel: SpaceTypeToggleItem[] = [
  // Types
  { name: "Change to basic space", icon: "img/toolbar/basic3.png", type: Space.DUEL_BASIC },
  { name: "Change to Mini-Game space", icon: "img/toolbar/minigameduel3.png", type: Space.MINIGAME },
  { name: "Change to reverse space", icon: "img/toolbar/reverse3.png", type: Space.DUEL_REVERSE },
  { name: "Change to happening space", icon: "img/toolbar/happeningduel3.png", type: Space.HAPPENING },
  { name: "Change to Game Guy space", icon: "img/toolbar/gameguyduel.png", type: Space.GAMEGUY },
  { name: "Change to power-up space", icon: "img/toolbar/powerup.png", type: Space.DUEL_POWERUP },
  { name: "Change to invisible space", icon: "img/toolbar/other.png", type: Space.OTHER },
  { name: "Change to blue start space", icon: "img/toolbar/startblue.png", type: Space.DUEL_START_BLUE, advanced: true },
  { name: "Change to red start space", icon: "img/toolbar/startred.png", type: Space.DUEL_START_RED, advanced: true },
];

function _getSpaceTypeToggles(gameVersion: 1 | 2 | 3, boardType: BoardType) {
  let types: SpaceTypeToggleItem[] = [];
  switch (gameVersion) {
    case 1:
      types = SpaceTypeToggleTypes_1;
      break;
    case 2:
      types = SpaceTypeToggleTypes_2;
      break;
    case 3:
      switch (boardType) {
        case BoardType.DUEL:
          types = SpaceTypeToggleTypes_3_Duel;
          break;
        default:
          types = SpaceTypeToggleTypes_3;
          break;
      }
      break;
  }

  if (!get($setting.uiAdvanced)) {
    types = types.filter(a => !a.advanced);
  }

  return types;
}

function _getSpaceSubTypeToggles(gameVersion: 1 | 2 | 3, boardType: BoardType) {
  let types: SpaceTypeToggleItem[] = [];
  switch (gameVersion) {
    case 1:
      types = SpaceSubTypeToggleTypes_1;
      break;
    case 2:
      types = SpaceSubTypeToggleTypes_2;
      break;
    case 3:
      switch (boardType) {
        case BoardType.DUEL:
          types = []; //SpaceSubTypeToggleTypes_3_Duel;
          break;
        default:
          types = SpaceSubTypeToggleTypes_3;
          break;
      }
      break;
  }

  if (!get($setting.uiAdvanced)) {
    types = types.filter(a => !a.advanced);
  }

  return types;
}

interface ISpaceTypeToggleProps {
  type?: Space;
  subtype?: SpaceSubtype;
  toggleTypes: any;
  typeChanged(type?: Space, subtype?: SpaceSubtype): any;
}

class SpaceTypeToggle extends React.Component<ISpaceTypeToggleProps> {
  onTypeChanged = (type: Space, subtype?: SpaceSubtype) => {
    this.props.typeChanged(type, subtype);
  }

  render() {
    const type = this.props.type;
    if (type === Space.START && !get($setting.uiAdvanced))
      return null; // Can't switch start space type
    const subtype = this.props.subtype;
    const onTypeChanged = this.onTypeChanged;
    const toggleTypes = this.props.toggleTypes || [];
    const toggles = toggleTypes.map((item: any) => {
      const key = item.type + "-" + item.subtype;
      const selected = (item.type !== undefined && type === item.type)
        || (item.subtype !== undefined && subtype !== undefined && subtype === item.subtype);
      return (
        <SpaceTypeToggleBtn key={key} type={item.type} subtype={item.subtype}
          icon={item.icon} title={item.name} selected={selected} typeChanged={onTypeChanged} />
      );
    });

    return (
      <div className="spaceToggleContainer">
        {toggles}
      </div>
    );
  }
};

interface ISpaceTypeToggleBtnProps {
  selected: boolean;
  icon: string;
  title: string;
  type: Space;
  subtype?: SpaceSubtype;
  typeChanged(type: Space, subtype?: SpaceSubtype): any;
}

class SpaceTypeToggleBtn extends React.Component<ISpaceTypeToggleBtnProps> {
  onTypeChanged = () => {
    if (this.props.subtype !== undefined && this.props.selected)
      this.props.typeChanged(this.props.type, undefined);
    else
      this.props.typeChanged(this.props.type, this.props.subtype);
  }

  render() {
    let btnClass = "spaceToggleButton";
    if (this.props.selected)
      btnClass += " selected";
    let size = this.props.subtype !== undefined ? 25 : 20;
    let onKeyDown = makeKeyClick(this.onTypeChanged, this);
    return (
      <div className={btnClass} title={this.props.title} tabIndex={0}
        onClick={this.onTypeChanged} onKeyDown={onKeyDown}>
        <img src={this.props.icon} height={size} width={size} />
      </div>
    );
  }
};

interface ISpaceStarCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onStarCheckChanged(changed: boolean): void;
}

class SpaceStarCheckbox extends React.Component<ISpaceStarCheckboxProps> {
  private checkboxEl: HTMLInputElement | null = null;

  render() {
    return (
      <div className="starCheckbox">
        <label><input type="checkbox"
          ref={el => this.checkboxEl = el}
          checked={this.props.checked}
          value={this.props.checked as any}
          onChange={this.onChange} /> Hosts star</label>
      </div>
    );
  }

  onChange = (event: any) => {
    this.props.onStarCheckChanged(event.target.checked);
  }

  componentDidMount() {
    this.checkboxEl!.indeterminate = this.props.indeterminate;
  }

  componentDidUpdate(prevProps: ISpaceStarCheckboxProps) {
    if (prevProps.indeterminate !== this.props.indeterminate) {
      this.checkboxEl!.indeterminate = this.props.indeterminate;
    }
  }
};

interface ISpaceDecisionTreeButtonProps {
  space: ISpace;
}

function SpaceDecisionTreeButton(props: ISpaceDecisionTreeButtonProps) {
  if (!props.space.aiTree) {
    return null;
  }

  return (
    <Button css="propertiesAiTreeButton" onClick={() => {
      $$log("Showing decision tree", props.space.aiTree);
      changeDecisionTree(props.space.aiTree!);
    }}>
      AI Decision Tree
    </Button>
  );
}

interface ISpaceEventsListProps {
  events?: ISpaceEvent[];
  board: IBoard;
  onEventAdded(event: any): void;
  onEventDeleted(event: ISpaceEvent): void;
  onEventActivationTypeToggle(event: ISpaceEvent): void;
  onEventParameterSet(event: ISpaceEvent, name: string, value: any): void;
}

class SpaceEventsList extends React.Component<ISpaceEventsListProps> {
  render() {
    let events = this.props.events || [];
    let id = 0;
    let entries = events.map((event: ISpaceEvent) => {
      return (
        <SpaceEventEntry event={event} key={`${event.id}-${id++}`}
          board={this.props.board}
          onEventDeleted={this.props.onEventDeleted}
          onEventActivationTypeToggle={this.props.onEventActivationTypeToggle}
          onEventParameterSet={this.props.onEventParameterSet} />
      );
    });
    let eventadd;
    // TODO: We could do something to restrict adding more events than realistic...
    //if (!entries.length) {
      eventadd = <SpaceEventAdd onEventAdded={this.props.onEventAdded} />;
    //}

    return (
      <div className="eventsList">
        {entries}
        {eventadd}
      </div>
    );
  }
};

interface ISpaceEventEntryProps {
  event: ISpaceEvent;
  board: IBoard;
  onEventDeleted(event: ISpaceEvent): void;
  onEventActivationTypeToggle(event: ISpaceEvent): void;
  onEventParameterSet(event: ISpaceEvent, name: string, value: number): void;
}

class SpaceEventEntry extends React.Component<ISpaceEventEntryProps> {
  onEventDeleted = () => {
    this.props.onEventDeleted(this.props.event);
  }

  onEventActivationTypeToggle = () => {
    this.props.onEventActivationTypeToggle(this.props.event);
    this.forceUpdate();
  }

  onEventParameterSet = (name: string, value: any) => {
    this.props.onEventParameterSet(this.props.event, name, value);
    this.forceUpdate();
  }

  render() {
    let spaceEvent = this.props.event;
    const event = getEvent(spaceEvent.id, this.props.board);
    if (!event)
      return null;
    let name = event.name || spaceEvent.id;

    let currentSpaceParameterIndex = 0;
    let parameterButtons;
    if (event.parameters) {
      parameterButtons = event.parameters.map((parameter: IEventParameter) => {
        const parameterValue = spaceEvent.parameterValues
          && spaceEvent.parameterValues[parameter.name];
        switch (parameter.type) {
          case EventParameterType.Boolean:
            return (
              <SpaceEventBooleanParameterButton key={parameter.name}
                parameter={parameter}
                parameterValue={parameterValue}
                onEventParameterSet={this.onEventParameterSet} />
            );

          case EventParameterType.Number:
          case EventParameterType.PositiveNumber:
            return (
              <SpaceEventNumberParameterButton key={parameter.name}
                parameter={parameter}
                parameterValue={parameterValue}
                positiveOnly={parameter.type === "+Number"}
                onEventParameterSet={this.onEventParameterSet} />
            );

          case EventParameterType.Space:
            return (
              <SpaceEventSpaceParameterButton key={parameter.name}
                parameter={parameter}
                spaceParameterIndex={currentSpaceParameterIndex++}
                parameterValue={parameterValue}
                onEventParameterSet={this.onEventParameterSet} />
            );

          case EventParameterType.NumberArray:
          default:
            return null;
        }
      })
    }

    return (
      <div className="eventEntry">
        <div className="eventEntryHeader">
          <span className="eventEntryName" title={name}>{name}</span>
          <div role="button" className="eventEntryDelete" onClick={this.onEventDeleted}
            title="Remove this event">✖</div>
        </div>
        <div className="eventEntryOptions">
          <SpaceEventActivationTypeToggle activationType={spaceEvent.activationType}
            onEventActivationTypeToggle={this.onEventActivationTypeToggle} />
          {parameterButtons}
        </div>
      </div>
    );
  }
};

interface ISpaceEventActivationTypeToggleProps {
  activationType: EventActivationType;
  onEventActivationTypeToggle(): void;
}

class SpaceEventActivationTypeToggle extends React.Component<ISpaceEventActivationTypeToggleProps> {
  onTypeToggle = () => {
    this.props.onEventActivationTypeToggle();
  }

  render() {
    let activationType = this.props.activationType;
    const activationTypes = EventActivationType;

    let activationTypeImages: any = {};
    activationTypeImages[activationTypes.WALKOVER] = "img/toolbar/eventpassing.png";
    activationTypeImages[activationTypes.LANDON] = "img/toolbar/eventstanding.png";
    let activationTypeToggleImg = activationTypeImages[activationType];
    if (!activationTypeToggleImg)
      return null;

    let activationTypeTitles: any = {};
    activationTypeTitles[activationTypes.WALKOVER] = "Occurs when passing over the space";
    activationTypeTitles[activationTypes.LANDON] = "Occurs when landing on the space";

    let activationTypeText = "";
    switch (activationType) {
      case activationTypes.WALKOVER:
        activationTypeText = "Passing event";
        break;
      case activationTypes.LANDON:
        activationTypeText = "Land-on event";
        break;
    }

    return (
      <div className="eventEntryItem eventEntryActivationTypeItem" onClick={this.onTypeToggle}>
        <img className="eventEntryActivationTypeToggle" alt="Activation Type"
          src={activationTypeToggleImg} title={activationTypeTitles[activationType]} />
        <span>{activationTypeText}</span>
      </div>
    );
  }
};

interface ISpaceEventNumberParameterButtonProps {
  parameter: IEventParameter;
  parameterValue: any;
  positiveOnly?: boolean;
  onEventParameterSet(name: string, value: number): any;
}

class SpaceEventNumberParameterButton extends React.Component<ISpaceEventNumberParameterButtonProps> {
  render() {
    const parameterValue = this.props.parameterValue;
    const valueHasBeenSet = parameterValue !== undefined && parameterValue !== null;
    const tooltip = `(Number) ${this.props.parameter.name}: ${valueHasBeenSet ? parameterValue : "null"}`;
    return (
      <div className="eventEntryItem" title={tooltip}
        onClick={this.onParameterClicked}>
        <span className="eventEntryItemParameterName">{this.props.parameter.name}:</span>
        &nbsp;
        {valueHasBeenSet ?
          <span>{this.props.parameterValue}</span>
          : <span className="eventEntryItemParameterUnset">null</span>
        }
      </div>
    );
  }

  onParameterClicked = () => {
    const name = this.props.parameter.name;
    const positiveOnly = this.props.positiveOnly;
    // Prompt the user for a value.
    const userValue =
      window.prompt(`Enter a${positiveOnly ? " positive " : " "}numeric value for the ${name} parameter`);
    if (!userValue) {
      return; // Enter nothing, ignore response.
    }
    const value = parseInt(userValue);
    if (isNaN(value)) {
      showMessage("The value entered could not be parsed into a number");
      return;
    }
    if (this.props.positiveOnly && value <= 0) {
      showMessage("The value entered must be a positive number");
      return;
    }
    this.props.onEventParameterSet(name, value);
  }
};

interface ISpaceEventBooleanParameterButtonProps {
  parameter: IEventParameter;
  parameterValue: any;
  positiveOnly?: boolean;
  onEventParameterSet(name: string, value: boolean): any;
}

class SpaceEventBooleanParameterButton extends React.Component<ISpaceEventBooleanParameterButtonProps> {
  render() {
    const parameterValue = this.props.parameterValue;
    const valueHasBeenSet = parameterValue !== undefined && parameterValue !== null;
    const tooltip = `(Boolean) ${this.props.parameter.name}: ${valueHasBeenSet ? parameterValue : "null"}`;
    return (
      <div className="eventEntryItem" title={tooltip}
        onClick={this.onParameterClicked}>
        <span className="eventEntryItemParameterName">{this.props.parameter.name}:</span>
        &nbsp;
        {valueHasBeenSet ?
          <span>{this.props.parameterValue.toString()}</span>
          : <span className="eventEntryItemParameterUnset">null</span>
        }
      </div>
    );
  }

  onParameterClicked = () => {
    const parameterValue = this.props.parameterValue;
    this.props.onEventParameterSet(this.props.parameter.name, !parameterValue);
  }
};

interface ISpaceEventSpaceParameterButtonProps {
  parameter: any;
  spaceParameterIndex: number;
  parameterValue: any;
  positiveOnly?: boolean;
  onEventParameterSet(name: string, value: number): any;
}

class SpaceEventSpaceParameterButton extends React.Component<ISpaceEventSpaceParameterButtonProps> {
  render() {
    const parameterValue = this.props.parameterValue;
    const valueHasBeenSet = parameterValue !== undefined && parameterValue !== null;
    const tooltip = `(Space) ${this.props.parameter.name}: ${valueHasBeenSet ? "set" : "null"}`
      + "\nDrag to a space to associate it";
    const color = getDistinctColor(this.props.spaceParameterIndex);
    const colorStyle = { backgroundColor: `rgb(${color.join(", ")})` };
    return (
      <div className="eventEntryItem eventEntryItemDraggable" title={tooltip}
        draggable={true}
        onDragStart={this.onDragStart}
        onClick={this.onParameterClicked}>
        <img alt="Target" src="img/events/target.png" />
        <span className="eventEntryItemParameterName">{this.props.parameter.name}:</span>
        &nbsp;
        {valueHasBeenSet ?
          <span className="eventEntryItemParameterSpaceSetWrapper">set
            <span style={colorStyle} className="eventEntryItemParameterColorSwatch"></span>
          </span>
          : <span className="eventEntryItemParameterUnset">null</span>
        }
      </div>
    );
  }

  onDragStart = (event: React.DragEvent<any>) => {
    setEventParamDropHandler(this.onSpaceDroppedOn);
    event.dataTransfer.setDragImage(getImage("targetImg"), 3, 0);
    event.dataTransfer.setData("text", JSON.stringify({
      isEventParamDrop: true
    }));
  }

  onSpaceDroppedOn = (spaceIndex: number) => {
    setEventParamDropHandler(null);
    if (spaceIndex >= 0) {
      this.props.onEventParameterSet(this.props.parameter.name, spaceIndex);
    }
  }

  onParameterClicked = () => {
    showMessage("To associate a space with this event, click and drag from this list entry and release over the target space.");
  }
};

interface ISpaceEventAddProps {
  onEventAdded(event: IEvent): void;
}

interface ISpaceEventAddState {
  selectedValue: number;
  libraryEvents: IEvent[];
  boardEvents: IEvent[];
}

class SpaceEventAdd extends React.Component<ISpaceEventAddProps, ISpaceEventAddState> {
  constructor(props: ISpaceEventAddProps) {
    super(props);

    const eventSets = _getEventsForAddList();
    this.state = {
      selectedValue: -1,
      libraryEvents: eventSets.libraryEvents.sort(_sortEvents),
      boardEvents: eventSets.boardEvents.sort(_sortEvents),
    }
  }

  private _refreshLists() {
    const eventSets = _getEventsForAddList();
    this.setState({
      libraryEvents: eventSets.libraryEvents.sort(_sortEvents),
      boardEvents: eventSets.boardEvents.sort(_sortEvents),
    });
  }

  onSelection = (e: any) => {
    let selectedOption = e.target.value;
    if (selectedOption == "-1")
      return;

    const [collection, index] = selectedOption.split(",");

    let event = copyObject((this as any).state[collection][index]);
    if (!event)
      throw new Error(`Could not add event ${selectedOption}`);

    this.props.onEventAdded(event);

    this._refreshLists();
  }

  render() {
    if (!this.state.libraryEvents.length && !this.state.boardEvents.length)
      return null;

    const eventOptions = [
      <option value="-1" key="-1" disabled>Add new event</option>
    ];

    let index = 0;

    if (this.state.boardEvents.length) {
      eventOptions.push(
        <optgroup label="Board Events" key="boardEvents">
          {
            this.state.boardEvents.map(event => {
              const identifier = "boardEvents," + index++;
              return (
                <option value={identifier} key={identifier}>{event.name}</option>
              );
            })
          }
        </optgroup>
      );
    }

    index = 0;
    eventOptions.push(
      <optgroup label="Library Events" key="libraryEvents">
        {
          this.state.libraryEvents.map(event => {
            const identifier = "libraryEvents," + index++;
            return (
              <option value={identifier} key={identifier}>{event.name}</option>
            );
          })
        }
      </optgroup>
    )

    return (
      <div className="eventAddSelectEntry">
        <select className="eventAddSelect" value={this.state.selectedValue} onChange={this.onSelection}>
          {eventOptions}
        </select>
      </div>
    );
  }
};

function _getEventsForAddList() {
  let libraryEvents = getAvailableEvents();

  let boardEvents = [];
  const board = getCurrentBoard();
  for (let eventName in board.events) {
    boardEvents.push(createCustomEvent(board.events[eventName]));
  }

  // Don't show library events that are also in the board events list.
  // Force the user to conscientiously go to Events to "upgrade" the version
  // of an event in use.
  libraryEvents = libraryEvents.filter(event => {
    return !(event.name in board.events);
  });

  return {
    libraryEvents,
    boardEvents,
  };
}

function _sortEvents(a: IEvent, b: IEvent) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

function _arrayContainsEvent(arr: any[], eventName: string): boolean {
  for (let e of arr) {
    if (e && e.id === eventName)
      return true;
  }
  return false;
}