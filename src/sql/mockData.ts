import mockDayDataModel from '@/model/mockDayData.model';
import mockHourDataModel from '@/model/mockHourData.model';
import mockMinuteTenDataModel from '@/model/mockMinuteTenData.model';
import mockMinuteThirtyDataModel from '@/model/mockMinuteThirtyData.model';

// 从initStartDate开始的往后10年
const batchCreateDayProcedureName = 'batch_insert_day';
const batchCreateHourProcedureName = 'batch_insert_hour';
const batchCreateMinuteTenProcedureName = 'batch_insert_minute_ten';
const batchCreateMinuteThirtyProcedureName = 'batch_insert_minute_thirty';

export const batchCreateDaySql = ({
  initStartDate = '2023-06-01 00:00:00',
  allDay = 365,
}) => {
  return {
    one: `DROP PROCEDURE IF EXISTS ${batchCreateDayProcedureName};`,
    two: `
  CREATE DEFINER = root @'%' PROCEDURE ${batchCreateDayProcedureName} ( number_to_insert INT ) BEGIN

    SET @x = 0;

    SET @date = '${initStartDate}';
    REPEAT

        SET @x = @x + 1;
      INSERT INTO ${mockDayDataModel.tableName} ( day, created_at, updated_at )
      VALUES
        ( @date, NOW(), NOW() );

      SET @date = DATE_ADD( @date, INTERVAL 1 DAY );
      UNTIL @x >= number_to_insert
    END REPEAT;

  END
  `,
    three: `call ${batchCreateDayProcedureName}(${allDay})`,
  };
};

export const batchCreateHourSql = ({
  initStartDate = '2023-06-01 00:00:00',
  allDay = 365,
}) => {
  return {
    one: `DROP PROCEDURE IF EXISTS ${batchCreateHourProcedureName};`,
    two: `
  CREATE DEFINER = root @'%' PROCEDURE ${batchCreateHourProcedureName} ( number_to_insert INT ) BEGIN

    SET @x = 0;

    SET @date = '${initStartDate}';
    REPEAT

        SET @x = @x + 1;
      INSERT INTO ${mockHourDataModel.tableName} ( hour, created_at, updated_at )
      VALUES
        ( @date, NOW(), NOW() );

      SET @date = DATE_ADD( @date, INTERVAL 1 HOUR );
      UNTIL @x >= number_to_insert
    END REPEAT;

  END
  `,
    three: `call ${batchCreateHourProcedureName}(${allDay * 24})`,
  };
};

export const batchCreateMinuteTenSql = ({
  initStartDate = '2023-06-01 00:00:00',
  allDay = 365,
}) => {
  return {
    one: `DROP PROCEDURE IF EXISTS ${batchCreateMinuteTenProcedureName};`,
    two: `
  CREATE DEFINER = root @'%' PROCEDURE ${batchCreateMinuteTenProcedureName} ( number_to_insert INT ) BEGIN

    SET @x = 0;

    SET @date = '${initStartDate}';
    REPEAT

        SET @x = @x + 1;
      INSERT INTO ${mockMinuteTenDataModel.tableName} ( minute, created_at, updated_at )
      VALUES
        ( @date, NOW(), NOW() );

      SET @date = DATE_ADD( @date, INTERVAL 10 MINUTE );
      UNTIL @x >= number_to_insert
    END REPEAT;

  END
  `,
    three: `call ${batchCreateMinuteTenProcedureName}(${
      allDay * 24 * (60 / 10)
    })`,
  };
};

export const batchCreateMinuteThirtySql = ({
  initStartDate = '2023-06-01 00:00:00',
  allDay = 365,
}) => {
  return {
    one: `DROP PROCEDURE IF EXISTS ${batchCreateMinuteThirtyProcedureName};`,
    two: `
  CREATE DEFINER = root @'%' PROCEDURE ${batchCreateMinuteThirtyProcedureName} ( number_to_insert INT ) BEGIN

    SET @x = 0;

    SET @date = '${initStartDate}';
    REPEAT

        SET @x = @x + 1;
      INSERT INTO ${mockMinuteThirtyDataModel.tableName} ( minute, created_at, updated_at )
      VALUES
        ( @date, NOW(), NOW() );

      SET @date = DATE_ADD( @date, INTERVAL 30 MINUTE );
      UNTIL @x >= number_to_insert
    END REPEAT;

  END
  `,
    three: `call ${batchCreateMinuteThirtyProcedureName}(${
      allDay * 24 * (60 / 30)
    })`,
  };
};
