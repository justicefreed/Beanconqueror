/** Interfaces */
import { BEAN_MIX_ENUM } from '../../enums/beans/mix';
/** Enums */
import { ROASTS_ENUM } from '../../enums/beans/roasts';
import { IBean } from '../../interfaces/bean/iBean';
/** Classes */
import { Config } from '../objectConfig/objectConfig';
import moment from 'moment';
import { BEAN_ROASTING_TYPE_ENUM } from '../../enums/beans/beanRoastingType';
import { IBeanInformation } from '../../interfaces/bean/iBeanInformation';
import { BeanRoastInformation } from './beanRoastInformation';
import { RoastingMachine } from '../roasting-machine/roasting-machine';
import { UIRoastingMachineStorage } from '../../services/uiRoastingMachineStorage';
import { IRoastingMachine } from '../../interfaces/roasting-machine/iRoastingMachine';
import { BeanProto } from '../../generated/src/classes/bean/bean';
import { ICupping } from '../../interfaces/cupping/iCupping';
import { IFlavor } from '../../interfaces/flavor/iFlavor';

export class Bean implements IBean {
  public name: string;
  public buyDate: string;
  public roastingDate: string;
  public note: string;

  public roaster: string;
  public config: Config;
  public roast: ROASTS_ENUM;
  public roast_range: number;
  public beanMix: BEAN_MIX_ENUM;

  // tslint:disable-next-line
  public roast_custom: string;
  public aromatics: string;
  public weight: number;
  public finished: boolean;
  public cost: number;
  public attachments: Array<string>;
  public cupping_points: string;
  public decaffeinated: boolean;
  public url: string;
  public ean_article_number: string;

  public rating: number;

  public bean_information: Array<IBeanInformation>;

  public bean_roasting_type: BEAN_ROASTING_TYPE_ENUM;

  /** Roast information are set from green beans **/
  public bean_roast_information: BeanRoastInformation;

  public qr_code: string;

  public favourite: boolean;
  public shared: boolean;
  public cupping: ICupping;

  public cupped_flavor: IFlavor;
  
  public frozen: boolean;
  public frozenDate: string;
  public daysFrozen: number;

  constructor() {
    this.name = '';
    this.buyDate = '';
    this.roastingDate = '';
    this.note = '';

    this.roaster = '';
    this.config = new Config();
    this.roast = 'UNKNOWN' as ROASTS_ENUM;
    this.roast_range = 0;
    this.roast_custom = '';
    this.beanMix = 'SINGLE_ORIGIN' as BEAN_MIX_ENUM;

    this.aromatics = '';
    this.weight = 0;
    this.finished = false;
    this.cost = 0;
    this.attachments = [];
    this.decaffeinated = false;
    this.cupping_points = '';
    this.bean_roasting_type = 'UNKNOWN' as BEAN_ROASTING_TYPE_ENUM;
    this.bean_information = [];
    this.url = '';
    this.ean_article_number = '';
    this.bean_roast_information = new BeanRoastInformation();
    this.rating = 0;
    this.qr_code = '';
    this.favourite = false;
    this.shared = false;

    this.cupping = {
      body: 0,
      brightness: 0,
      clean_cup: 0,
      complexity: 0,
      cuppers_correction: 0,
      dry_fragrance: 0,
      finish: 0,
      flavor: 0,
      sweetness: 0,
      uniformity: 0,
      wet_aroma: 0,
      notes: '',
    };

    this.cupped_flavor = {
      predefined_flavors: {},
      custom_flavors: [],
    } as IFlavor;
    
    this.frozen = false;
    this.frozenDate = '';
    this.daysFrozen = 0;
  }

  public getRoastName(): string {
    return ROASTS_ENUM[this.roast];
  }
  public getCustomRoastName(): string {
    if (this.roast === ROASTS_ENUM.CUSTOM_ROAST) {
      return this.roast_custom;
    }
    return '-';
  }

  public initializeByObject(beanObj: IBean): void {
    Object.assign(this, beanObj);

    // Newer version, this information may not exist
    if (beanObj.bean_roast_information) {
      this.bean_roast_information = new BeanRoastInformation();
      Object.assign(
        this.bean_roast_information,
        beanObj.bean_roast_information
      );
    }
  }
  public initializeBySharedProtoBean(beanObj: BeanProto): void {
    Object.assign(this, beanObj);

    // Newer version, this information may not exist
    if (beanObj.bean_roast_information) {
      this.bean_roast_information = new BeanRoastInformation();
      Object.assign(
        this.bean_roast_information,
        beanObj.bean_roast_information
      );
    }

    //Older bean versions may not have this information when initialization
    if (this.cupping === undefined) {
      this.cupping = {
        body: 0,
        brightness: 0,
        clean_cup: 0,
        complexity: 0,
        cuppers_correction: 0,
        dry_fragrance: 0,
        finish: 0,
        flavor: 0,
        sweetness: 0,
        uniformity: 0,
        wet_aroma: 0,
        notes: '',
      };
    }
    if (this.cupped_flavor === undefined) {
      this.cupped_flavor = {
        predefined_flavors: {},
        custom_flavors: [],
      } as IFlavor;
    }
  }
  public hasCustomFlavors(): boolean {
    return this.cupped_flavor.custom_flavors.length > 0;
  }
  public hasPredefinedFlavors(): boolean {
    return Object.keys(this.cupped_flavor.predefined_flavors).length > 0;
  }
  public fixDataTypes(): boolean {
    let fixNeeded: boolean = false;

    if (Number(this.cost) !== this.cost) {
      this.cost = Number(this.cost);
      fixNeeded = true;
    }

    if (Number(this.weight) !== this.weight) {
      this.weight = Number(this.weight);
      fixNeeded = true;
    }

    return fixNeeded;
  }

  /**
   * Get the ISO Datetime string for new frozen date as now
   * Doing this here to keep time calcs in this file
   */
  public getNewFrozenDate(): string {
      return moment(Date.now()).toISOString();
  }

  /**
   * Get the ISO Datetime string for new adjusted roasting date
   * or '' if no valid calculable date
   */
  public getNewDaysFrozen(): number {
      const today = moment(Date.now()).startOf('day');
      const frozenDate = moment(this.frozenDate).startOf('day');
      return this.daysFrozen + today.diff(frozenDate, 'days');
  }

  public beanAgeInDays(): number {
    if (Boolean(this.roastingDate) == false) {
        return 0;
    }
    const roastingDate = moment(this.roastingDate).startOf('day');
    let asOfDate = moment(Date.now()).startOf('day');
    if (this.frozen && Boolean(this.frozenDate)) {
      // if currently frozen, use the frozen date instead of today
      asOfDate = moment(this.frozenDate).startOf('day');
    }
    const daysSinceRoast = asOfDate.diff(roastingDate, 'days')
    const ageDays = daysSinceRoast - this.daysFrozen;
    if (ageDays < 0) {
      // handle edge case where roasting date manually changed fwd after beans unfrozen
      return 0;
    }
    return ageDays
  }

  /**
   * Get the calculated bean age for this brew
   */
  public getCalculatedBeanAge(): number {
    const roastingDate = moment(this.roastingDate);
    const brewTime = moment.unix(moment().unix());

    return brewTime.diff(roastingDate, 'days');
  }

  public isSelfRoasted(): boolean {
    if (this.bean_roast_information && this.bean_roast_information.bean_uuid) {
      return true;
    }
    return false;
  }
  public isScannedBean(): boolean {
    if (this.qr_code !== '') {
      return true;
    }
    return false;
  }

  private getRoastingMachineStorage(): UIRoastingMachineStorage {
    let uiRoastingMachineStorage: UIRoastingMachineStorage;
    uiRoastingMachineStorage = UIRoastingMachineStorage.getInstance();

    return uiRoastingMachineStorage;
  }

  public getRoastingMachine(): RoastingMachine {
    const iRoastingMachine: IRoastingMachine =
      this.getRoastingMachineStorage().getByUUID(
        this.bean_roast_information.roaster_machine
      ) as IRoastingMachine;
    const roastingMachine: RoastingMachine = new RoastingMachine();
    roastingMachine.initializeByObject(iRoastingMachine);

    return roastingMachine;
  }

  public hasPhotos() {
    return this.attachments && this.attachments.length > 0;
  }
}
