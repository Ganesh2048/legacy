import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamiliesModule } from './modules/families/families.module';
import { MembersModule } from './modules/members/members.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawTtl = config.get<number | string>('THROTTLE_TTL');
        let ttl = 60000;
        if (rawTtl !== undefined && rawTtl !== null) {
          const numTtl = Number(rawTtl);
          ttl = numTtl < 1000 ? numTtl * 1000 : numTtl;
        }
        const rawLimit = config.get<number | string>('THROTTLE_LIMIT');
        const limit = rawLimit !== undefined && rawLimit !== null ? Number(rawLimit) : 5;
        return [
          {
            ttl,
            limit,
          },
        ];
      },
    }),
    PrismaModule,
    AuthModule,
    FamiliesModule,
    MembersModule,
    MemoriesModule,
    TimelineModule,
    SearchModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
