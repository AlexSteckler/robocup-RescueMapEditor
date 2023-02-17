import {
  Body,
  Controller,
  Get,
  OnModuleInit,
  Patch,
  Post,
} from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { UpdateUserProfile } from './dto/update-userProfile.dto';
import { LocationDto } from './dto/find-location.dto';
import { UpdateUserCredentials } from './dto/update-userCredentials.dto';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

// https://github.com/keycloak/keycloak-nodejs-admin-client
@Controller({
  version: '1',
  path: 'admin',
})
export class AdminController implements OnModuleInit {
  kcAdminClient = new KcAdminClient({
    baseUrl: this.configService.get<string>('KEYCLOAK_URI'),
    realmName: 'master',
  });

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const credentials: any = {
      username: this.configService.get<string>('KEYCLOAK_USER'),
      password: this.configService.get<string>('KEYCLOAK_PASSWORD'),
      grantType: 'password',
      clientId: 'admin-cli',
    };
    await this.kcAdminClient.auth(credentials);
    this.kcAdminClient.setConfig({
      realmName: 'RoboCup',
    });

    //Refresh
    setInterval(async () => {
      this.kcAdminClient.setConfig({
        realmName: 'master',
      });
      await this.kcAdminClient.auth(credentials);
      this.kcAdminClient.setConfig({
        realmName: 'RoboCup',
      });
    }, 58 * 1000); // 58 sec
  }

  @Patch('user')
  @Roles({ roles: ['realm:default-roles-robocup'] })
  async updateUserProfile(
    @AuthenticatedUser() user: any,
    @Body() updateUserProfile: UpdateUserProfile,
  ) {
    await this.kcAdminClient.users.update({ id: user.sub }, updateUserProfile);
  }

  @Post('registerMapper')
  async registerVolunteer(
    @Body() location: LocationDto,
    @AuthenticatedUser() user: any,
  ) {
    const roleRepresentation = await this.kcAdminClient.roles.findOneByName({
      name: 'futureMapper',
    });
    await this.kcAdminClient.users.addRealmRoleMappings({
      id: user.sub,
      roles: [{ id: roleRepresentation.id, name: roleRepresentation.name }],
    });
    await this.kcAdminClient.users.update(
      { id: user.sub },
      { attributes: { location: location.location } },
    );
  }

  @Patch('setMapperRole')
  @Roles({ roles: ['realm:quali'] })
  async addVolunteerRole(
    @AuthenticatedUser() user: any,
    @Body() updateUserCredentials: UpdateUserCredentials,
  ): Promise<UserRepresentation> {
    let roleRepresentation = await this.kcAdminClient.roles.findOneByName({
      name: 'mapper',
    });
    await this.kcAdminClient.users.addRealmRoleMappings({
      id: updateUserCredentials.id,
      roles: [{ id: roleRepresentation.id, name: roleRepresentation.name }],
    });
    roleRepresentation = await this.kcAdminClient.roles.findOneByName({
      name: 'futureMapper',
    });
    await this.kcAdminClient.users.delRealmRoleMappings({
      id: updateUserCredentials.id,
      roles: [{ id: roleRepresentation.id, name: roleRepresentation.name }],
    });
    const userRepresentation = await this.kcAdminClient.users.findOne({
      id: updateUserCredentials.id,
    });
    userRepresentation.realmRoles = ['mapper'];
    return userRepresentation;
  }

  @Patch('deleteMapperRole')
  @Roles({ roles: ['realm:quali'] })
  async removeQualiRole(
    @AuthenticatedUser() user: any,
    @Body() updateUserCredentials: UpdateUserCredentials,
  ): Promise<UserRepresentation> {
    let roleRepresentation = await this.kcAdminClient.roles.findOneByName({
      name: 'mapper',
    });
    await this.kcAdminClient.users.delRealmRoleMappings({
      id: updateUserCredentials.id,
      roles: [{ id: roleRepresentation.id, name: roleRepresentation.name }],
    });
    roleRepresentation = await this.kcAdminClient.roles.findOneByName({
      name: 'futureMapper',
    });
    await this.kcAdminClient.users.addRealmRoleMappings({
      id: updateUserCredentials.id,
      roles: [{ id: roleRepresentation.id, name: roleRepresentation.name }],
    });
    const userRepresentation = await this.kcAdminClient.users.findOne({
      id: updateUserCredentials.id,
    });
    userRepresentation.realmRoles = ['futureMapper'];
    return userRepresentation;
  }

  @Get('getMapper')
  @Roles({ roles: ['realm:quali'] })
  async getQuali(
    @AuthenticatedUser() user: any,
  ): Promise<UserRepresentation[]> {
    let userRepresentations = await this.kcAdminClient.roles.findUsersWithRole({
      name: 'mapper',
    });
    userRepresentations = userRepresentations.filter(
      (userRepresentation) =>
        userRepresentation.attributes &&
        userRepresentation.attributes.location[0] === user.location,
    );
    userRepresentations.forEach(
      (userRepresentation) => (userRepresentation.realmRoles = ['mapper']),
    );
    let userRepresentationsFuture =
      await this.kcAdminClient.roles.findUsersWithRole({
        name: 'futureMapper',
      });
    userRepresentationsFuture.forEach(
      (userRepresentation) =>
        (userRepresentation.realmRoles = ['futureMapper']),
    );
    userRepresentationsFuture = userRepresentationsFuture.filter(
      (userRepresentation) =>
        userRepresentation.attributes &&
        userRepresentation.attributes.location[0] === user.location,
    );
    return userRepresentationsFuture.concat(userRepresentations);
  }
}
