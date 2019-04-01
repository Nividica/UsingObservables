
export interface IUserBasic {
  UserName: string;
  LastLogin: Date;
}

export interface IUserProfile {
  AvatarPath: string;
  Preferences: { [pref: string]: any; };
}

export interface IUserAuth {
  LastPasswordChanged: Date;
  Groups: Array<string>;
}

export interface IUserSocial {
  FriendList: Array<string>;
}

export interface IUserObject extends IUserBasic, IUserProfile, IUserAuth, IUserSocial { }

export type AlertOp = 'ShowAlert' | 'Wait' | 'Noop';

export type ReunionNames = { owner: string, pet: string };
