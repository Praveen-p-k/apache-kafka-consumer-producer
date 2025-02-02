import { Global, Module } from '@nestjs/common';
import { AuthTokenService } from 'src/shared-kernel/utils/auth-token.service';
import { HttpModule } from '@nestjs/axios';
import { QueryBuilderService } from './query-builder.service';
import { TransformService } from './transform.service';
import { SxTHelperService } from './sxt-helper.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    AuthTokenService,
    QueryBuilderService,
    TransformService,
    SxTHelperService,
  ],
  exports: [
    AuthTokenService,
    QueryBuilderService,
    TransformService,
    SxTHelperService,
  ],
})
export class SharedModule {}
