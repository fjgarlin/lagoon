/*
    To run all tests here, execute the following command:
    $  yarn test billingCalculations --colors

    To run a specific test, you can use the tags at the end of the description.
    Example:
    $ yarn test billingCalculations --colors -t "#USD #FC"
*/
import { CURRENCIES, AVAILABILITY } from './pricing';
import {
  hitsCost,
  storageCost,
  prodCost,
  devCost,
  hitTier,
  IBillingGroup,
  projectsDataReducer,
  calculateProjectEnvironmentsTotalsToBill,
  getProjectsCosts,
  BillingGroupCosts
} from './billingCalculations';
import { availabilityProjectsCosts } from './helpers';
import { defaultModifier } from './resolvers.test';
import {
  initializeGraphQL,
  allBillingModifiers,
  addBillingModifier,
  deleteBillingModifier,
  deleteAllBillingModifiers
} from './graphql';
import moment = require('moment');
import { deleteGroup } from '../project/keycloak';

interface ITestBillingGroup extends IBillingGroup {
  expectations?: {
    hits: number;
    storage: number;
    prod: number;
    dev: number;
  };
}
interface IMockDataType {
  billingGroups: ITestBillingGroup[];
}

// month: 'July 2019',
const mockData: IMockDataType = {
  billingGroups: [
    {
      // CH - July 2019
      name: 'VF',
      expectations: {
        hits: 75.52,
        storage: 0,
        prod: 62.05,
        dev: 0,
      },
      currency: CURRENCIES.USD,
      billingSoftware: 'xero',
      projects: [
        {
          name: 'v-ch',
          month: 7,
          year: 2019,
          hits: 1_075,
          availability: AVAILABILITY.STANDARD,
          storageDays: 197,
          prodHours: 744,
          devHours: 0,
        },
        {
          name: 'v-web',
          month: 7,
          year: 2019,
          hits: 342_371,
          availability: AVAILABILITY.STANDARD,
          storageDays: 0,
          prodHours: 744,
          devHours: 744,
        },
      ],
    },
    {
      name: 'SV',
      expectations: {
        hits: 1468.61,
        storage: 11.41,
        prod: 310.02,
        dev: 0,
      },
      currency: CURRENCIES.USD,
      billingSoftware: 'xero',
      projects: [
        {
          name: 's_com',
          month: 7,
          year: 2019,
          hits: 6_833_467,
          availability: AVAILABILITY.HIGH,
          storageDays: 784.064378,
          prodHours: 744,
          devHours: 1488,
        },
        {
          name: 's_m_com',
          month: 7,
          year: 2019,
          hits: 13_782,
          availability: AVAILABILITY.HIGH,
          storageDays: 23.725226,
          prodHours: 744,
          devHours: 744,
        },
        {
          name: 'd8beta_s_com',
          month: 7,
          year: 2019,
          hits: 0,
          availability: AVAILABILITY.HIGH,
          storageDays: 0,
          prodHours: 744,
          devHours: 1488,
        },
      ],
    },
    {
      name: 'FC',
      expectations: {
        hits: 1265.95,
        storage: 22.18,
        prod: 206.68,
        dev: 62.05,
      },
      currency: CURRENCIES.USD,
      billingSoftware: '',
      projects: [
        {
          name: 'fc_com',
          month: 8,
          year: 2019,
          hits: 5_120_109,
          availability: AVAILABILITY.HIGH,
          storageDays: 971.194088,
          prodHours: 744,
          devHours: 5208,
        },
        {
          name: 'mil_fc_com',
          month: 8,
          year: 2019,
          hits: 279_553,
          availability: AVAILABILITY.HIGH,
          storageDays: 4.80221,
          prodHours: 744,
          devHours: 2232,
        },
      ],
    },
    {
      name: 'Swiss - OYW',
      expectations: {
        hits: 55.0,
        storage: 0,
        prod: 51.63,
        dev: 25.6,
      },
      currency: CURRENCIES.GBP,
      billingSoftware: '',
      projects: [
        {
          name: 'l2030',
          month: 8,
          year: 2019,
          hits: 56_147,
          availability: AVAILABILITY.STANDARD,
          storageDays: 16.897876,
          prodHours: 744,
          devHours: 1488,
        },
        {
          name: 'oyw',
          month: 8,
          year: 2019,
          hits: 102_352,
          availability: AVAILABILITY.STANDARD,
          storageDays: 45.075144,
          prodHours: 744,
          devHours: 3695,
        },
      ],
    },
    {
      name: 'MIS',
      expectations: {
        hits: 55,
        storage: 0,
        prod: 25.82,
        dev: 0,
      },
      currency: CURRENCIES.GBP,
      billingSoftware: '',
      projects: [
        {
          name: 'co',
          month: 8,
          year: 2019,
          hits: 86_766,
          availability: AVAILABILITY.STANDARD,
          storageDays: 0,
          prodHours: 744,
          devHours: 0,
        },
      ],
    },
    {
      name: 'AUS-COM',
      expectations: {
        hits: 481.37,
        storage: 0,
        prod: 446.4,
        dev: 203.58,
      },
      currency: CURRENCIES.AUD,
      billingSoftware: '',
      projects: [
        {
          name: 'fta',
          month: 8,
          year: 2019,
          hits: 0,
          availability: AVAILABILITY.STANDARD,
          storageDays: 12,
          prodHours: 744,
          devHours: 0,
        },
        {
          name: 'cd',
          month: 8,
          year: 2019,
          hits: 14186,
          availability: AVAILABILITY.STANDARD,
          storageDays: 101,
          prodHours: 744,
          devHours: 2_232,
        },
        {
          name: 'zpor',
          month: 8,
          year: 2019,
          hits: 0,
          availability: AVAILABILITY.STANDARD,
          storageDays: 25,
          prodHours: 744,
          devHours: 649,
        },
        {
          name: 'zpub',
          month: 8,
          year: 2019,
          hits: 20_938,
          availability: AVAILABILITY.STANDARD,
          storageDays: 23,
          prodHours: 744,
          devHours: 744,
        },
        {
          name: 'apmpor',
          month: 8,
          year: 2019,
          hits: 0,
          availability: AVAILABILITY.STANDARD,
          storageDays: 4,
          prodHours: 0,
          devHours: 2_137,
        },
        {
          name: 'zhi',
          month: 8,
          year: 2019,
          hits: 234,
          availability: AVAILABILITY.STANDARD,
          storageDays: 3,
          prodHours: 744,
          devHours: 0,
        },
        {
          name: 'moa',
          month: 8,
          year: 2019,
          hits: 240_264,
          availability: AVAILABILITY.STANDARD,
          storageDays: 121,
          prodHours: 744,
          devHours: 382,
        },
        {
          name: 'flt',
          month: 8,
          year: 2019,
          hits: 555_994,
          availability: AVAILABILITY.STANDARD,
          storageDays: 74,
          prodHours: 744,
          devHours: 1_999,
        },
        {
          name: 'pha',
          month: 8,
          year: 2019,
          hits: 788_270,
          availability: AVAILABILITY.STANDARD,
          storageDays: 164,
          prodHours: 744,
          devHours: 744,
        },
      ],
    },
  ],
};

// {
//   name: '',
//   expectations: {
//     hits: -999,
//     storage: -999,
//     prod: -999,
//     dev: -999,
//   },
//   currency: CURRENCIES.USD,
//   billingSoftware: '',
//   projects: [
//     {
//       name: '',
//       month: ,
//       year: 2019,
//       hits: ,
//       availability: AVAILABILITY.,
//       storageDays: ,
//       prodHours: ,
//       devHours: ,
//     },
//   ],
// },

const { projects: p1 } = mockData.billingGroups[0];
const { projects: p2 } = mockData.billingGroups[1];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const hitsCostTestString = (group: ITestBillingGroup) =>
  `Given ${group.projects.length} project(s) with ${
    group.projects[0].availability
  } availability and hits [${group.projects
    .map(project => project.hits)
    .join()}], during ${
    monthNames[group.projects[0].month - 1]
  } the cost should be ${group.expectations.hits} #hits #${group.currency} #${
    group.name
  }: `;

const storageCostTestString = (group: ITestBillingGroup) =>
  `Given the total storage of ${
    group.projects.length
  } project(s), and GBDays [${group.projects
    .map(project => project.storageDays)
    .join()}], during ${
    monthNames[group.projects[0].month - 1]
  } the cost should be ${group.expectations.storage}. #storage #${
    group.currency
  } #${group.name}`;

const prodEnvironmentCostTestString = (group: ITestBillingGroup) =>
  `Given a billing group with ${
    group.projects.length
  } project(s), running for [${group.projects
    .map(project => project.prodHours)
    .join()}] hours during ${
    monthNames[group.projects[0].month - 1]
  } the cost should be ${group.expectations.prod}. #prod #${group.currency} #${
    group.name
  } `;

const devEnvironmentCostTestString = (group: ITestBillingGroup) =>
  `Given a billing group with ${
    group.projects.length
  } project(s), running for [${group.projects
    .map(project => project.devHours)
    .join()}] hours during ${
    monthNames[group.projects[0].month - 1]
  } the cost should be ${group.expectations.dev}. #dev #${group.currency} #${
    group.name
  }`;

const currencyFilter = currency => group =>
  group.currency === CURRENCIES[currency];

// Unit Under Test
describe('Billing Calculations', () => {
  describe('Hit Tier #hit-tier', () => {
    // scenarios and expectation
    it('When hits are between { MIN: 300_001, MAX: 2_500_000 }, then the "hitTier should be 1', () => {
      // Arrange
      // Act
      const hits = projectsDataReducer(p1, 'hits');
      // Assert
      expect(hitTier(hits)).toBe(1);
    });

    it('When hits are between { MIN: 2_500_001, MAX: 10_000_000 }, then the "hitTier should be 2', () => {
      // Arrange
      // Act
      const hits = projectsDataReducer(p2, 'hits');
      // Assert
      expect(hitTier(hits)).toBe(2);
    });
  });

  describe('Hit Costs - Customers billed in US Dollars (USD) #Hits #USD', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.USD)).map(group => {
      it(hitsCostTestString(group), () => {
        // Act
        const { cost } = hitsCost(group);
        // Assert
        expect(cost).toBe(group.expectations.hits);
      });
    });
  });

  describe('Hit Costs - Customers billed in Pounds (GBP) #Hits #GBP', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.GBP)).map(group => {
      it(hitsCostTestString(group), () => {
        // Act
        const { cost } = hitsCost(group);
        // Assert
        expect(cost).toBe(group.expectations.hits);
      });
    });
  });

  describe('Storage Costs - Customers billed in US Dollars (USD) #Storage #USD', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.USD)).map(group => {
      it(storageCostTestString(group), () => {
        // Act
        const { cost } = storageCost(group);
        // Assert
        expect(cost).toBe(group.expectations.storage);
      });
    });
  });

  describe('Storage Costs - Customers billed in Pounds (GBP) #Storage #GBP', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.GBP)).map(group => {
      it(storageCostTestString(group), () => {
        // Act
        const { cost } = storageCost(group);
        // Assert
        expect(cost).toBe(group.expectations.storage);
      });
    });
  });

  describe('Prod Environment Costs - Customers billed in US Dollars (USD) #Environment #USD', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.USD)).map(group => {
      it(prodEnvironmentCostTestString(group), () => {
        // Act
        const { cost } = prodCost(group);
        // Assert
        expect(cost).toBe(group.expectations.prod);
      });
    });
  });

  describe('Dev Environment Costs - Customers billed in US Dollars (USD) #Environment #USD', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.USD)).map(group => {
      it(devEnvironmentCostTestString(group), () => {
        // Act
        const { cost } = devCost(group);
        // Assert
        try {
          expect(cost).toBe(group.expectations.dev);
        } catch (exception) {
          console.log(exception);
          throw exception;
        }
      });
    });
  });

  describe('Environment Costs - Customers billed in Pounds (GBP) #Environment #GBP', () => {
    // scenarios and expectation
    mockData.billingGroups.filter(currencyFilter(CURRENCIES.GBP)).map(group => {
      it(prodEnvironmentCostTestString(group), () => {
        // Act
        const { cost } = prodCost(group);
        // Assert
        expect(cost).toBe(group.expectations.prod);
      });

      it(devEnvironmentCostTestString(group), () => {
        // Act
        const { cost } = devCost(group);
        // Assert
        expect(cost).toBe(group.expectations.dev);
      });
    });
  });

  describe('Project Environment Totals #CalculateProjectEnvironmentTotals', () => {
    it('When the following Project Environments Mock Data is provided, the totals should match the expected result.', () => {
      // Arrange
      const environments = [
        {
          name: 'dev',
          type: 'development',
          hits: {
            total: 0
          },
          storage: {
            bytesUsed: '537192',
            month: '2019-11'
          },
          hours: {
            month: '2019-11',
            hours: 389
          }
        },
        {
          name: 'master',
          type: 'production',
          hits: {
            total: 0
          },
          storage: {
            bytesUsed: '340448',
            month: '2019-11'
          },
          hours: {
            month: '2019-11',
            hours: 389
          }
        },
        {
          name: 'stage',
          type: 'development',
          hits: {
            total: 0
          },
          storage: {
            bytesUsed: '299612',
            month: '2019-11'
          },
          hours: {
            month: '2019-11',
            hours: 388
          }
        }
      ];

      // Act
      const result = calculateProjectEnvironmentsTotalsToBill(environments);
      // Assert
      const expected = {
        hits: 0,
        storageDays: 1.177252,
        prodHours: 389,
        devHours: 777
      };
      expect(result).toMatchObject(expected);
    });
  });

  describe('Billing Cost Modifiers', () => {
    beforeAll(async () => {
      await initializeGraphQL();
    });

    afterEach(async () => {
      await deleteAllBillingModifiers({ name: defaultModifier.group.name })
  }, 50000);

    it('Total Costs with single `discountFixed` modifier. #modifiers, #discountFixed', () => {
      // Arrange
      const projects = [
        {
          availability: 'HIGH',
          month: '11',
          year: '2019',
          hits: 5_742_733,
          storageDays: 4.6473,
          prodHours: 720,
          devHours: 2160
        },
        {
          availability: 'HIGH',
          month: '11',
          year: '2019',
          hits: 2_491_865,
          storageDays: 1196.266357,
          prodHours: 720,
          devHours: 1461
        }
      ];

      // Act
      const result = getProjectsCosts('CHF', projects, [
        { discountFixed: 761.26 }
      ]);

      // Assert
      const expected = {
        hitCost: 1662.84,
        storageCost: 30,
        environmentCost: {
          prod: 200.02,
          dev: 10.3
        },
        total: 1141.8999999999999
      };

      expect(result).toMatchObject(expected);
    });

    it('Total Costs with `discountPercentage` modifier (50% discount). #modifiers, #discountPercentage', () => {
      // Arrange
      const projects = [
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        },
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        }
      ];

      // Act
      const result = getProjectsCosts('USD', projects, [
        { discountPercentage: 50 }
      ]);

      // Assert
      const expected = {
        hitCost: 324,
        storageCost: 656.01,
        environmentCost: {
          prod: 60.05,
          dev: 1.67
        },
        total: 520.865 // 1041.73 before discount
      };

      expect(result).toMatchObject(expected);
    });

    it('Total Costs with `extraFixed` modifier. ($100 extra). #modifiers, #extraFixed', () => {
      // Arrange
      const projects = [
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        },
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        }
      ];

      // Act
      const result = getProjectsCosts('USD', projects, [{ extraFixed: 100 }]);

      // Assert
      const expected = {
        hitCost: 324,
        storageCost: 656.01,
        environmentCost: {
          prod: 60.05,
          dev: 1.67
        },
        total: 1141.73 // 1041.73 before extra
      };

      expect(result).toMatchObject(expected);
    });

    it('Total Costs with `extraPercentage` modifier. (100% extra - 2x original). #modifiers, #extraPercentage', () => {
      // Arrange
      const projects = [
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        },
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        }
      ];

      // Act
      const result = getProjectsCosts('USD', projects, [
        { extraPercentage: 100 }
      ]);

      // Assert
      const expected = {
        hitCost: 324,
        storageCost: 656.01,
        environmentCost: {
          prod: 60.05,
          dev: 1.67
        },
        total: 2083.46 // 1041.73 before extra
      };

      expect(result).toMatchObject(expected);
    });

    it('Total Costs with Multiple modifiers. (100% + $100 with lower weight used first). #modifiers, #multiple', () => {
      // Arrange
      const projects = [
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        },
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        }
      ];

      // Act
      const result = getProjectsCosts('USD', projects, [
        { extraFixed: 100, weight: 100 },
        { extraPercentage: 100, weight: 0 }
      ]);

      // Assert
      const expected = {
        hitCost: 324,
        storageCost: 656.01,
        environmentCost: {
          prod: 60.05,
          dev: 1.67
        },
        total: 2183.46 // 1041.73 before extra
      };

      expect(result).toMatchObject(expected);
    });

    it('Given a modifier for a specific month, check that month before, & after, are not effected. #modifiers, #specific-month', async () => {
      // Note - whatver modifiers are passed to the billing calculations will be utilized in calculating the totals.
      // Therefore, we implicitily test for the above assertion by testing that that billing calculations are correct
      // in normal situations, and that they are correct with modifiers. We also can test for
      // the above assertion by checking that the correct modifiers are returned given a specific month.

      // The call graph starts with the function below
      // src/models/group.ts > billingGroupCost calls `availabilityProjectCosts(projects, 'HIGH|STANDARD', currency, modifiers)`

      // Arrange

      const startDate = moment()
        .startOf('month')
        .format('MM-DD-YYYY');
      const endDate = moment()
        .endOf('month')
        .format('MM-DD-YYYY');
      const modifier = {
        ...defaultModifier,
        startDate,
        endDate,
        discountFixed: 0,
        extraFixed: 1000
      };
      // Create modifier for current month/year with an end date 1 month in the future
      const { data: addedModifier } = await addBillingModifier(modifier);

      if (!addedModifier.data.addBillingModifier) {
        throw new Error(addedModifier.errors[0].message);
      }

      const {
        data: {
          addBillingModifier: { id }
        }
      } = addedModifier;

      const mockProjects = [
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        },
        {
          availability: 'STANDARD',
          month: '11',
          year: '2019',
          hits: 1000000,
          storageDays: 10000,
          prodHours: 720,
          devHours: 1500
        }
      ];

      const lastMonth = moment()
        .subtract(1, 'M')
        .format('YYYY-MM')
        .toString();
      const nextMonth = moment()
        .add(1, 'M')
        .format('YYYY-MM')
        .toString();
      const currMonth = moment()
        .format('YYYY-MM')
        .toString();

      // Act

      // Get all modifiers for the billingGroup for last month
      const { data: lastMonthData } = await allBillingModifiers(
        defaultModifier.group,
        lastMonth
      );
      if (!lastMonthData.data.allBillingModifiers) {
        throw new Error(lastMonthData.errors[0].message);
      }
      const {
        data: { allBillingModifiers: lastMonthBillingGroupModifiers }
      } = lastMonthData;

      // Get all modifiers for the billing group for next month
      const { data: nextMonthData } = await allBillingModifiers(
        defaultModifier.group,
        nextMonth
      );
      if (!nextMonthData.data.allBillingModifiers) {
        throw new Error(nextMonthData.errors[0].message);
      }
      const {
        data: { allBillingModifiers: nextMonthBillingGroupModifiers }
      } = nextMonthData;

      // Get all modifiers for the current month
      const { data: currMonthData } = await allBillingModifiers(
        defaultModifier.group,
        currMonth
      );
      if (!currMonthData.data.allBillingModifiers) {
        throw new Error(currMonthData.errors[0].message);
      }
      const {
        data: { allBillingModifiers: currMonthBillingGroupModifiers }
      } = currMonthData;

      // Request costs for last month
      const lastMonthCosts = availabilityProjectsCosts(
        mockProjects,
        AVAILABILITY.STANDARD,
        CURRENCIES.CHF,
        lastMonthBillingGroupModifiers
      ) as BillingGroupCosts;

      // Request costs for next month
      const nextMonthCosts = availabilityProjectsCosts(
        mockProjects,
        AVAILABILITY.STANDARD,
        CURRENCIES.CHF,
        nextMonthBillingGroupModifiers
      );

      // Request costs for current month
      const currMonthCosts = availabilityProjectsCosts(
        mockProjects,
        AVAILABILITY.STANDARD,
        CURRENCIES.CHF,
        currMonthBillingGroupModifiers
      );

      // Assert

      // There should only be a single modifier for the current month
      expect(lastMonthBillingGroupModifiers.length).toBe(0);
      expect(nextMonthBillingGroupModifiers.length).toBe(0);
      expect(currMonthBillingGroupModifiers.length).toBe(1);

      // The billing costs should only be different for the last and next month
      expect(lastMonthCosts.total).toBeLessThan(currMonthCosts.total);
      expect(nextMonthCosts.total).toBeLessThan(currMonthCosts.total);

      expect(currMonthCosts.modifiers.length).toBe(1);
    });

    it('Given a Billing modifier that expires far in the future, and another modifier for a single month, ensure that both modifiers are applied for the single month, and that only the long running modifier is applied outside of the single modifier month. #modifiers, #future', async () => {

      // Arrange
      const foreverStartDate = moment().startOf('month').format('MM-DD-YYYY');
      const foreverEndDate = moment().add(100, 'years').format('MM-DD-YYYY');
      const foreverModifierData = { ...defaultModifier, startDate: foreverStartDate, endDate: foreverEndDate };
      const { data: foreverModifier } = await addBillingModifier(foreverModifierData);

      if (!foreverModifier.data.addBillingModifier) {
        throw new Error(foreverModifier.errors[0].message);
      }

      const singleMonthStartDate = moment().startOf('month').format('MM-DD-YYYY');
      const singleMonthEndDate = moment().endOf('month').format('MM-DD-YYYY');
      const singleMonthModifierData = { ...defaultModifier, startDate: singleMonthStartDate, endDate: singleMonthEndDate };
      const { data: singleMonthModifier } = await addBillingModifier(singleMonthModifierData);

      if (!singleMonthModifier.data.addBillingModifier) {
        throw new Error(singleMonthModifier.errors[0].message);
      }

      const lastMonth = moment().subtract(1, 'M').format('YYYY-MM').toString();
      const nextMonth = moment().add(1, 'M').format('YYYY-MM').toString();
      const nextYear = moment().add(1, "year").format('YYYY-MM').toString();
      const currMonth = moment().format('YYYY-MM').toString();

      // Act

      // Get all modifiers for the billingGroup for last month
      const { data: { data: { allBillingModifiers: lastMonthBillingGroupModifiers } } }
        = await allBillingModifiers( defaultModifier.group, lastMonth);

      // Get all modifiers for the billing group for next month
      const { data: { data: { allBillingModifiers: nextMonthBillingGroupModifiers } } }
        = await allBillingModifiers(defaultModifier.group, nextMonth);

      // Get all modifiers for the billing group for next year
      const { data: { data: { allBillingModifiers: nextYearBillingGroupModifiers } } }
        = await allBillingModifiers(defaultModifier.group, nextYear);

      // Get all modifiers for the current month
      const { data: { data: { allBillingModifiers: currMonthBillingGroupModifiers } } }
        = await allBillingModifiers(defaultModifier.group, currMonth);

      // Assert

      expect(lastMonthBillingGroupModifiers.length).toBe(0);
      expect(nextMonthBillingGroupModifiers.length).toBe(1);
      expect(currMonthBillingGroupModifiers.length).toBe(2);
      expect(nextYearBillingGroupModifiers.length).toBe(1);
    });




    it('Given a single, or multiple, Billing modifiers that would generage a negative total, ensure it does not go below 0 (zero). #belowZero', async() => {

      // Arrange
      const startDate = moment().startOf('month').format('MM-DD-YYYY');
      const endDate = moment().endOf('month').format('MM-DD-YYYY');
      const modifier = { ...defaultModifier, startDate, endDate, discountFixed: 100_000};
      await addBillingModifier(modifier);

      const mockProjects = [
        {
          availability: 'STANDARD',
          month: moment().month() + 1,
          year: moment().year(),
          hits: 0,
          storageDays: 0,
          prodHours: 0,
          devHours: 0
        },
      ];

      // Get all modifiers for the current month
      const currMonth = moment().format('YYYY-MM').toString();
      const { data: { data: { allBillingModifiers: modifiers } } } = await allBillingModifiers( defaultModifier.group, currMonth);

      // Act

      // Costs for current month
      const currMonthCosts = availabilityProjectsCosts( mockProjects, AVAILABILITY.STANDARD, CURRENCIES.CHF, modifiers );

      // Assert
      expect(currMonthCosts.modifiers.length).toBe(1);
      expect(currMonthCosts.modifiers[0].discountFixed).toBe(modifier.discountFixed)
      expect(currMonthCosts.total).toBe(0);
    });


  });
}); // End Billing Calculations
