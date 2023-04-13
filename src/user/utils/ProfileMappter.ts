import type { ProfileDbModel, ProfileViewModel } from '../types';

export class ProfileMapper {
  public static toViewModel(model: ProfileDbModel | null): ProfileViewModel {
    return {
      username: model?.username ?? '',
      name: model?.profile?.name ?? '',
      surname: model?.profile?.surname ?? '',
      aboutMe: model?.profile?.aboutMe ?? '',
      city: model?.profile?.city ?? '',
      birthday: model?.profile?.birthday ?? null,
      avatar: {
        url: model?.avatar?.url ?? null,
        previewUrl: model?.avatar?.previewUrl ?? null,
      },
    };
  }
}
