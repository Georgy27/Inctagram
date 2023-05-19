import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

import { PRODUCTION_MODE } from 'src/common/constants';

@Injectable()
export class SchemaDropNotificationService
  implements OnModuleInit, OnModuleDestroy
{
  private pgClient: pg.Client;

  public constructor(private readonly configService: ConfigService) {
    this.pgClient = new pg.Client({
      connectionString: this.configService.get<string>('DATABASE_URL'),
      ssl: true,
    });
  }

  public async onModuleInit() {
    await this.pgClient.connect();

    await this.pgClient.query(`
    CREATE OR REPLACE FUNCTION notify_schema_drop() RETURNS event_trigger AS $$
    BEGIN
      PERFORM pg_notify('schema_drop', 'Schema dropped');
    END;
    $$ LANGUAGE plpgsql;

    DROP EVENT TRIGGER IF EXISTS trigger_schema_drop;

    CREATE EVENT TRIGGER trigger_schema_drop
      ON ddl_command_start
      WHEN TAG IN ('DROP SCHEMA')
      EXECUTE FUNCTION notify_schema_drop();

    LISTEN schema_drop;
    `);

    this.pgClient.on('notification', () => {
      const url = this.configService.get<string>('TELEGRAM_URL');
      const chat_id = this.configService.get<string>('TELEGRAM_CHAT_ID');
      const mode = this.configService.get<string>('MODE');

      if (!url || mode !== PRODUCTION_MODE) return;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animation:
            'https://media.tenor.com/TG5OF7UkLasAAAAC/thanos-infinity.gif',
          chat_id,
          method: 'sendAnimation',
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
        })
        .catch(() => 'Can not send notification');
    });
  }

  public async onModuleDestroy() {
    await this.pgClient.end();
  }
}
