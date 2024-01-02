## [1.6.3](https://github.com/displayeo/core-api/compare/1.6.2...1.6.3) (2023-11-12)


### Bug Fixes

* **types:** convert NativeDate too ([ecf23b2](https://github.com/displayeo/core-api/commit/ecf23b2b5e7150cf83e9a2ba4d04c33979ba06f8))

## [1.6.2](https://github.com/displayeo/core-api/compare/1.6.1...1.6.2) (2023-11-12)


### Bug Fixes

* **types:** fix company owner ID field in workspace API ([4fd48e6](https://github.com/displayeo/core-api/commit/4fd48e6d178186618343bec22c3d6024b13f20e0))

## [1.6.1](https://github.com/displayeo/core-api/compare/1.6.0...1.6.1) (2023-11-12)


### Bug Fixes

* **types:** export correect OutputProtectedWorkspaceInvitationDelete ([a304e69](https://github.com/displayeo/core-api/commit/a304e696e5b4e4cfed94223cb818138c589ca282))

# [1.6.0](https://github.com/displayeo/core-api/compare/1.5.2...1.6.0) (2023-11-11)


### Features

* **core:** add dev:staging script ([1cb08a5](https://github.com/displayeo/core-api/commit/1cb08a577b27441b3974ada7756ac67a92bb4c26))

## [1.5.2](https://github.com/displayeo/core-api/compare/1.5.1...1.5.2) (2023-11-05)


### Bug Fixes

* refactor entities and interfaces ([b8f20c1](https://github.com/displayeo/core-api/commit/b8f20c12eba12936c0a9edd059d3b9b8e592bce6))

## [1.5.1](https://github.com/displayeo/core-api/compare/1.5.0...1.5.1) (2023-10-20)


### Bug Fixes

* **auth:** change iss to displayeo ([f432de0](https://github.com/displayeo/core-api/commit/f432de02cc11378274a915b50c71dc20284fa671))
* **public:** remove _id & userId in GET /token ([1ccfc9d](https://github.com/displayeo/core-api/commit/1ccfc9dfd2a60cfc1899a75323dcaad615698dc5))

# [1.5.0](https://github.com/displayeo/core-api/compare/1.4.9...1.5.0) (2023-10-07)


### Features

* **crisp:** add crispTokenId to user, add uuid package ([d19d812](https://github.com/displayeo/core-api/commit/d19d812c1ea14930c218acb0b55954153f2376b3))

## [1.4.9](https://github.com/displayeo/core-api/compare/1.4.8...1.4.9) (2023-10-05)


### Bug Fixes

* **docker:** move base image to alpine ([36f8094](https://github.com/displayeo/core-api/commit/36f8094f1b022e0fbd86228d5e079bcd760f33b2))

## [1.4.8](https://github.com/displayeo/core-api/compare/1.4.7...1.4.8) (2023-10-05)


### Bug Fixes

* **core:** add express type dependencies ([6d5981e](https://github.com/displayeo/core-api/commit/6d5981e591f22406e00f7ad8cb6fd28e8f1c1019))

## [1.4.7](https://github.com/displayeo/core-api/compare/1.4.6...1.4.7) (2023-10-05)


### Bug Fixes

* **core:** remove .npmrc ([06d069d](https://github.com/displayeo/core-api/commit/06d069dcf4aca44ae751b4e8d15c7639c673d4f1))

## [1.4.6](https://github.com/displayeo/core-api/compare/1.4.5...1.4.6) (2023-09-21)


### Bug Fixes

* **reset:** remove token id validation ([cb89f75](https://github.com/displayeo/core-api/commit/cb89f75dd43174f916bfe1228ee38b868fc78c6e))

## [1.4.5](https://github.com/displayeo/core-api/compare/1.4.4...1.4.5) (2023-09-20)


### Bug Fixes

* **core:** add email to payment account creation ([c506c89](https://github.com/displayeo/core-api/commit/c506c8997aeb53db857a686340367a77bd0788f0))
* **mail:** remove debug mail ([535db23](https://github.com/displayeo/core-api/commit/535db23c963a1140d72f39e79d53ec7e5443389a))

## [1.4.4](https://github.com/displayeo/core-api/compare/1.4.3...1.4.4) (2023-08-08)


### Bug Fixes

* **token:** refresh token when user is owner ([eb39d05](https://github.com/displayeo/core-api/commit/eb39d05be97eace172e49aca5d172ff30811992b))

## [1.4.3](https://github.com/displayeo/core-api/compare/1.4.2...1.4.3) (2023-08-08)


### Bug Fixes

* **account:** fix request to payment api on company creation ([2ba0035](https://github.com/displayeo/core-api/commit/2ba00357ec84b557d643b8ae354e201d6a2df0e1))
* **login:** check if user is owner of workspace or company ([89e9a70](https://github.com/displayeo/core-api/commit/89e9a70f7143e0c95c63f19405575a5d48030bfd))

## [1.4.2](https://github.com/displayeo/core-api/compare/1.4.1...1.4.2) (2023-08-07)


### Bug Fixes

* **workspace:** filter out workspaces without company ([d6f73cc](https://github.com/displayeo/core-api/commit/d6f73cc4a4b996e60efeb5b12734774d87347872))

## [1.4.1](https://github.com/displayeo/core-api/compare/1.4.0...1.4.1) (2023-08-07)


### Bug Fixes

* **workspace:** switch workspace control objectId and string ([79cb582](https://github.com/displayeo/core-api/commit/79cb582334cd2af5fa1f1e49b285065f318575c4))

# [1.4.0](https://github.com/displayeo/core-api/compare/1.3.1...1.4.0) (2023-08-07)


### Bug Fixes

* **workspace:** switch workspace when use is owner ([93ef667](https://github.com/displayeo/core-api/commit/93ef667c11bdc1a47cdb4a3ea2c16cb0f89121da))


### Features

* **payment:** creating payment account when creating company ([#65](https://github.com/displayeo/core-api/issues/65)) ([9b5db2f](https://github.com/displayeo/core-api/commit/9b5db2fa0144e3edd9fb8ebc5e4afa5840dfd852))

## [1.3.1](https://github.com/displayeo/core-api/compare/1.3.0...1.3.1) (2023-06-26)


### Bug Fixes

* **entities:** add BILLING entity ([1cd4655](https://github.com/displayeo/core-api/commit/1cd46554453289e54c36fcfedc9fe69debea791a))

# [1.3.0](https://github.com/displayeo/core-api/compare/1.2.8...1.3.0) (2023-06-25)


### Bug Fixes

* **api:** order of router paths ([ff4cdc4](https://github.com/displayeo/core-api/commit/ff4cdc4e951a472efc9ebfda66d1dab7628e9350))
* **ci:** use rollup to generate types ([6c471b5](https://github.com/displayeo/core-api/commit/6c471b5748ca8f359908832c9d3b16f04cc2badd))
* **core:** compile enums in another file in js ([a794762](https://github.com/displayeo/core-api/commit/a79476217101b185a94aabb4d01a0feaf2e5179c))
* **feat:** add new types ([6ea30b9](https://github.com/displayeo/core-api/commit/6ea30b9f31eb33213192c1d28fb9155ae67a6b56))
* **middleware:** req chaining to multiple routes ([f373cb2](https://github.com/displayeo/core-api/commit/f373cb25f84556886a87a7525fec718fc2b7496c))
* **types:** add workspace type ([#60](https://github.com/displayeo/core-api/issues/60)) ([43ca599](https://github.com/displayeo/core-api/commit/43ca59988bb70da2045c6d0fc6e84f0e1af45c14))
* **types:** remove type for keys ([f3180ba](https://github.com/displayeo/core-api/commit/f3180ba9d35a439213201880fc5661b51c6e1ade))
* **workspace:** add validations for req.id parm ([5a6f611](https://github.com/displayeo/core-api/commit/5a6f6111d4b15158dba13adab7896566932f4c17))
* **workspace:** sending res twice ([c9b23bc](https://github.com/displayeo/core-api/commit/c9b23bcb8c4f99e0ed81a70942507a1848e7fff9))


### Features

* **refactor:** add few types ([022e608](https://github.com/displayeo/core-api/commit/022e6084fb4a95d624c1a4127837d2e2148ca4fd))
* **validations:** add review changes ([3e387e0](https://github.com/displayeo/core-api/commit/3e387e0e5b4eb0798e1ab31527e79dc20c334ee7))
* **validations:** rafactor and add validations ([87bb175](https://github.com/displayeo/core-api/commit/87bb1757f6c4e6015103b4e53e3445095ed43675))
* **validations:** refactor and add validations at mongoose level ([2d32fee](https://github.com/displayeo/core-api/commit/2d32fee3636489b312ebfa5bba87f5bf1180e1ab))
* **validations:** use global error handling ([33c4f6d](https://github.com/displayeo/core-api/commit/33c4f6dd1f463bb6cb3edf3c091f81386efbbfce))
* **workspace:** add mongoose validations ([cfa2f3c](https://github.com/displayeo/core-api/commit/cfa2f3c799af5472cdb30a86bd4170f4c0140919))
* **workspace:** refactored protected resources ([2297330](https://github.com/displayeo/core-api/commit/22973309f74595f46dd50bbed48cad2528038928))

## [1.2.8](https://github.com/displayeo/core-api/compare/1.2.7...1.2.8) (2023-06-22)


### Bug Fixes

* **ci:** use rollup to generate types ([3d0b69f](https://github.com/displayeo/core-api/commit/3d0b69f268223905b8681be91d7ba77729b2fd5b))

## [1.2.7](https://github.com/displayeo/core-api/compare/1.2.6...1.2.7) (2023-06-21)


### Bug Fixes

* **types:** fix workspace types ([097c7d8](https://github.com/displayeo/core-api/commit/097c7d8572dc3d16ea042b8ebc37ff4a61effce9))

## [1.2.6](https://github.com/displayeo/core-api/compare/1.2.5...1.2.6) (2023-06-20)


### Bug Fixes

* **types:** add permissions to workspace _members ([827d3ac](https://github.com/displayeo/core-api/commit/827d3ac961abb747202ad0becdc576aa77c327ab))

## [1.2.5](https://github.com/displayeo/core-api/compare/1.2.4...1.2.5) (2023-06-18)


### Bug Fixes

* **core:** fix package description ([9066e52](https://github.com/displayeo/core-api/commit/9066e52e7d2cd555205580e340959e1fa0f691cd))

## [1.2.4](https://github.com/displayeo/core-api/compare/1.2.3...1.2.4) (2023-06-12)


### Bug Fixes

* **core:** return always error object instead of errors ([a3f98a3](https://github.com/displayeo/core-api/commit/a3f98a3522e3c9a72ac2f7ed9b8cee922f86d0ed))

## [1.2.3](https://github.com/displayeo/core-api/compare/1.2.2...1.2.3) (2023-06-12)


### Bug Fixes

* **workspace:** add read workspace endpoint ([40ec5a9](https://github.com/displayeo/core-api/commit/40ec5a96cce49a915afad9256b618dc7e37a9f65))
* **workspace:** add read workspace endpoint types ([309dfaa](https://github.com/displayeo/core-api/commit/309dfaad382e5cd4a6d5de457f6c79d33a5fa8ef))

## [1.2.2](https://github.com/displayeo/core-api/compare/1.2.1...1.2.2) (2023-06-08)


### Bug Fixes

* **core:** add companyId to resolved account in auth middleware ([0edac70](https://github.com/displayeo/core-api/commit/0edac703975e6029a306cf024a44146946ea6b6b))

## [1.2.1](https://github.com/displayeo/core-api/compare/1.2.0...1.2.1) (2023-06-07)


### Bug Fixes

* **jwt:** get workspace data from database when refresh token ([d4190b2](https://github.com/displayeo/core-api/commit/d4190b2b4c38c6eb2bec64c6196c18656571d492))

# [1.2.0](https://github.com/displayeo/core-api/compare/1.1.0...1.2.0) (2023-06-07)


### Features

* **workspace:** show members & invitations for admins writers only ([ec1e5d9](https://github.com/displayeo/core-api/commit/ec1e5d9811ab7e5f7420ab3f4f46b23aa85a259c))

# [1.1.0](https://github.com/displayeo/core-api/compare/1.0.7...1.1.0) (2023-06-07)


### Bug Fixes

* **jwt:** add workspace details to jwt ([8bc5b5c](https://github.com/displayeo/core-api/commit/8bc5b5cece0f1a9387142541cce13aa441e5525e))
* **jwt:** company is found from workspace not user ([f66fb9d](https://github.com/displayeo/core-api/commit/f66fb9d29aadab8501d8c197e0392a68d224fb26))
* **permission:** distinguish read and list ([eb9998c](https://github.com/displayeo/core-api/commit/eb9998caa2d840d93136215dcf3daf8e1dc612f2))
* **types:** add enum to types ([a51e1c7](https://github.com/displayeo/core-api/commit/a51e1c743dd0ee624e489370a797f13ebb844f77))
* **workspace:** setting isDefault for workspace when creating ([#32](https://github.com/displayeo/core-api/issues/32)) ([9949452](https://github.com/displayeo/core-api/commit/9949452cec00ec226ee6fbd5e637266af7b1db22))


### Features

* **core:** add all permissions ([acb8225](https://github.com/displayeo/core-api/commit/acb82257e782cec2e1fe8a88715dfb48b74ec446))

## [1.0.7](https://github.com/displayeo/core-api/compare/1.0.6...1.0.7) (2023-06-05)


### Bug Fixes

* **typescript:** remove enums from types ([5f2f19a](https://github.com/displayeo/core-api/commit/5f2f19af75b5e1e7aecd1c448f8920311fb0ba5b))

## [1.0.6](https://github.com/displayeo/core-api/compare/1.0.5...1.0.6) (2023-06-05)


### Bug Fixes

* **typescript:** add isOwner to jwt interface ([680074d](https://github.com/displayeo/core-api/commit/680074d265f59224105ffeae47fc1305dea07bde))

## [1.0.5](https://github.com/displayeo/core-api/compare/1.0.4...1.0.5) (2023-06-05)


### Bug Fixes

* **auth:** add isOwner to jwt and clean refresh token ([af4d3ae](https://github.com/displayeo/core-api/commit/af4d3ae8879d034eb8e4319edf1734611b477c41))

## [1.0.4](https://github.com/displayeo/core-api/compare/1.0.3...1.0.4) (2023-05-31)


### Bug Fixes

* **core:** remove js from endpoints router ([#22](https://github.com/displayeo/core-api/issues/22)) ([af43ce5](https://github.com/displayeo/core-api/commit/af43ce57d69ee28ed8122feefa4b7ba77b7d49b9))

## [1.0.3](https://github.com/displayeo/core-api/compare/1.0.2...1.0.3) (2023-05-31)


### Bug Fixes

* **workspace:** return only workspaces of the user ([6eac3c3](https://github.com/displayeo/core-api/commit/6eac3c300f0c9f057914ae987389f418c84c6ab8))

# 1.0.0 (2023-05-25)


### Bug Fixes

* add env sample with empty variables ([533f29a](https://github.com/displayeo/core-api/commit/533f29a1ce20931eda1f4d2e8189ea093e4d830f))
* **api:** take into account js ([5180688](https://github.com/displayeo/core-api/commit/5180688c0ff04ac53c8e6cd19739c28133a95d1b))
* **auth:** add jwt decoded type ([ac35cd1](https://github.com/displayeo/core-api/commit/ac35cd1bc33eaef6269c7c719b7ff834e8df3689))
* **ci:** check on PR develop and main ([5c437c1](https://github.com/displayeo/core-api/commit/5c437c116cd682cf29cf0cb25803af3293eca9a3))
* **ci:** remove npmrc ([c3af30a](https://github.com/displayeo/core-api/commit/c3af30af79e7d2ccbd2b3815d9e94eb68fe66dc3))
* **company:** add more control to company creation ([a4b65fc](https://github.com/displayeo/core-api/commit/a4b65fccccdf8c4f757657d3c39790e6b77de89f))
* **core:** add admin and runner folders ([117306d](https://github.com/displayeo/core-api/commit/117306d6ff4441e2d2b5a7404773d405def0c22f))
* **core:** fix package ([11e31a9](https://github.com/displayeo/core-api/commit/11e31a9f42c58b0d3b1182379a5c68c79eef9862))
* **core:** fix typo dislayeo ([bdc5cd7](https://github.com/displayeo/core-api/commit/bdc5cd74b3e3d977c9dd9293664e90e6981aa585))
* **core:** log endpoints ([7cb6769](https://github.com/displayeo/core-api/commit/7cb6769fce3965148f68dd832e83a83db0135507))
* **core:** router accept same name for file and folder ([cfe5a47](https://github.com/displayeo/core-api/commit/cfe5a47829c54e33f448df357037d21a80958385))
* **core:** router accept same name for file and folder ([6149ca8](https://github.com/displayeo/core-api/commit/6149ca855bf613d955137891a00a32381b830104))
* **invitation:** remove email from body ([90186ec](https://github.com/displayeo/core-api/commit/90186ecce6702851c0f29316b880cb208bb60f18))
* **jwt:** add id instead of name ([8672f54](https://github.com/displayeo/core-api/commit/8672f54622a36e0248810c0298c3793bf2ffdd3c))
* **jwt:** replace name by id for access jwt ([eac138d](https://github.com/displayeo/core-api/commit/eac138dcc94cb7b92e4915277a4b8d384c8b4d3b))
* **login:** refreshToken typo ([61325b9](https://github.com/displayeo/core-api/commit/61325b9fe99eb64e806e723246a7ac17b7e19023))
* **models:** rename team as workspace and token as tokenPassword ([e0232fd](https://github.com/displayeo/core-api/commit/e0232fd664f429a6051b60f39c67b76ec01b93a0))
* **password:** add /public/token/:id to check if the token is valid ([7fdc075](https://github.com/displayeo/core-api/commit/7fdc0759282221fba1684e45b23b4f598e507deb))
* **signup:** add signup endpoint ([fab26a7](https://github.com/displayeo/core-api/commit/fab26a7ed9a1fba00846577b27382d59adcab3d3))
* **signup:** add signup endpoint - missing welcome mail ([95eb2da](https://github.com/displayeo/core-api/commit/95eb2dace1d52f9bfed397dccb9c51068d643cf5))
* **user:** change jobTitle and jobType ([3114001](https://github.com/displayeo/core-api/commit/31140015de6fe39104d0e8da4bef899f3dca5756))
* **workspace:** add permissions control ([a82422a](https://github.com/displayeo/core-api/commit/a82422a8d86b0b5a30220f59afcdc48f1b4d4eaf))
* **workspace:** regenerate tokens when switch workspace ([22f5123](https://github.com/displayeo/core-api/commit/22f5123df73d5a248f186667e88d001cf02bc161))


### Features

* **auth:** add refresh token endpoint ([b28fa4d](https://github.com/displayeo/core-api/commit/b28fa4d2c2387d3f561daacb0ff0982dec541cf2))
* **auth:** use different secret for the refresh token ([519afd1](https://github.com/displayeo/core-api/commit/519afd1d33e851cb48b712cc5c0f91d89f4c6e3f))
* **company:** setting company  endpoint ([8d817e9](https://github.com/displayeo/core-api/commit/8d817e95b3bb9785022e43748ddc7f465ad346c7))
* **forgot:** setting forgot password endpoint ([38c2cbc](https://github.com/displayeo/core-api/commit/38c2cbcf51ada19040dd3f961e5cdca5ffbfcbff))
* **invitation:** setting invitation endpoint ([090bcfd](https://github.com/displayeo/core-api/commit/090bcfde42540cdbe1e569e39ff0822ce04ded68))
* **reset:** setting reset password endpoint ([faba897](https://github.com/displayeo/core-api/commit/faba897ed3c5d7b2d551484621ba24f9e7ada252))
* **signup:** add contact to mailjet and send welcome mail ([1c6ab7a](https://github.com/displayeo/core-api/commit/1c6ab7a9eef31a3bf27db5ff73e20555f2b93178))
* **team:** setting teams endpoint ([6091f7f](https://github.com/displayeo/core-api/commit/6091f7f8b016b6f51e898440c61898cba641f7a1))
* **teamuser:** setting teams membership endpoint ([ef95343](https://github.com/displayeo/core-api/commit/ef95343a6c57a1eeadd584ea5296d544e3580af7))
* **transaction:** adding a new function to run transactions easily ([4eaa15f](https://github.com/displayeo/core-api/commit/4eaa15fdd374469219273c2df7ad2028c80251f4))
* **user:** new update password endpoint ([#9](https://github.com/displayeo/core-api/issues/9)) ([747dcfe](https://github.com/displayeo/core-api/commit/747dcfe432451bbedda5f7deb1e60ae129ef8a3b))
* **workspace:** add endpoint get for runner ([#10](https://github.com/displayeo/core-api/issues/10)) ([c1536d4](https://github.com/displayeo/core-api/commit/c1536d4df987a98eedcd0c245cc17ffca653dbe3))
* **workspace:** add invitations count to workspace list ([eacc307](https://github.com/displayeo/core-api/commit/eacc30790519532fa725c6cccf41de0a23b3654b))

# 1.0.0 (2023-05-25)


### Bug Fixes

* add env sample with empty variables ([533f29a](https://github.com/displayeo/core-api/commit/533f29a1ce20931eda1f4d2e8189ea093e4d830f))
* **api:** take into account js ([5180688](https://github.com/displayeo/core-api/commit/5180688c0ff04ac53c8e6cd19739c28133a95d1b))
* **auth:** add jwt decoded type ([ac35cd1](https://github.com/displayeo/core-api/commit/ac35cd1bc33eaef6269c7c719b7ff834e8df3689))
* **ci:** check on PR develop and main ([5c437c1](https://github.com/displayeo/core-api/commit/5c437c116cd682cf29cf0cb25803af3293eca9a3))
* **ci:** remove npmrc ([c3af30a](https://github.com/displayeo/core-api/commit/c3af30af79e7d2ccbd2b3815d9e94eb68fe66dc3))
* **company:** add more control to company creation ([a4b65fc](https://github.com/displayeo/core-api/commit/a4b65fccccdf8c4f757657d3c39790e6b77de89f))
* **core:** add admin and runner folders ([117306d](https://github.com/displayeo/core-api/commit/117306d6ff4441e2d2b5a7404773d405def0c22f))
* **core:** fix package ([11e31a9](https://github.com/displayeo/core-api/commit/11e31a9f42c58b0d3b1182379a5c68c79eef9862))
* **core:** fix typo dislayeo ([bdc5cd7](https://github.com/displayeo/core-api/commit/bdc5cd74b3e3d977c9dd9293664e90e6981aa585))
* **core:** log endpoints ([7cb6769](https://github.com/displayeo/core-api/commit/7cb6769fce3965148f68dd832e83a83db0135507))
* **core:** router accept same name for file and folder ([cfe5a47](https://github.com/displayeo/core-api/commit/cfe5a47829c54e33f448df357037d21a80958385))
* **core:** router accept same name for file and folder ([6149ca8](https://github.com/displayeo/core-api/commit/6149ca855bf613d955137891a00a32381b830104))
* **invitation:** remove email from body ([90186ec](https://github.com/displayeo/core-api/commit/90186ecce6702851c0f29316b880cb208bb60f18))
* **jwt:** add id instead of name ([8672f54](https://github.com/displayeo/core-api/commit/8672f54622a36e0248810c0298c3793bf2ffdd3c))
* **jwt:** replace name by id for access jwt ([eac138d](https://github.com/displayeo/core-api/commit/eac138dcc94cb7b92e4915277a4b8d384c8b4d3b))
* **login:** refreshToken typo ([61325b9](https://github.com/displayeo/core-api/commit/61325b9fe99eb64e806e723246a7ac17b7e19023))
* **models:** rename team as workspace and token as tokenPassword ([e0232fd](https://github.com/displayeo/core-api/commit/e0232fd664f429a6051b60f39c67b76ec01b93a0))
* **password:** add /public/token/:id to check if the token is valid ([7fdc075](https://github.com/displayeo/core-api/commit/7fdc0759282221fba1684e45b23b4f598e507deb))
* **signup:** add signup endpoint ([fab26a7](https://github.com/displayeo/core-api/commit/fab26a7ed9a1fba00846577b27382d59adcab3d3))
* **signup:** add signup endpoint - missing welcome mail ([95eb2da](https://github.com/displayeo/core-api/commit/95eb2dace1d52f9bfed397dccb9c51068d643cf5))
* **user:** change jobTitle and jobType ([3114001](https://github.com/displayeo/core-api/commit/31140015de6fe39104d0e8da4bef899f3dca5756))
* **workspace:** add permissions control ([a82422a](https://github.com/displayeo/core-api/commit/a82422a8d86b0b5a30220f59afcdc48f1b4d4eaf))
* **workspace:** regenerate tokens when switch workspace ([22f5123](https://github.com/displayeo/core-api/commit/22f5123df73d5a248f186667e88d001cf02bc161))


### Features

* **auth:** add refresh token endpoint ([b28fa4d](https://github.com/displayeo/core-api/commit/b28fa4d2c2387d3f561daacb0ff0982dec541cf2))
* **auth:** use different secret for the refresh token ([519afd1](https://github.com/displayeo/core-api/commit/519afd1d33e851cb48b712cc5c0f91d89f4c6e3f))
* **company:** setting company  endpoint ([8d817e9](https://github.com/displayeo/core-api/commit/8d817e95b3bb9785022e43748ddc7f465ad346c7))
* **forgot:** setting forgot password endpoint ([38c2cbc](https://github.com/displayeo/core-api/commit/38c2cbcf51ada19040dd3f961e5cdca5ffbfcbff))
* **invitation:** setting invitation endpoint ([090bcfd](https://github.com/displayeo/core-api/commit/090bcfde42540cdbe1e569e39ff0822ce04ded68))
* **reset:** setting reset password endpoint ([faba897](https://github.com/displayeo/core-api/commit/faba897ed3c5d7b2d551484621ba24f9e7ada252))
* **signup:** add contact to mailjet and send welcome mail ([1c6ab7a](https://github.com/displayeo/core-api/commit/1c6ab7a9eef31a3bf27db5ff73e20555f2b93178))
* **team:** setting teams endpoint ([6091f7f](https://github.com/displayeo/core-api/commit/6091f7f8b016b6f51e898440c61898cba641f7a1))
* **teamuser:** setting teams membership endpoint ([ef95343](https://github.com/displayeo/core-api/commit/ef95343a6c57a1eeadd584ea5296d544e3580af7))
* **transaction:** adding a new function to run transactions easily ([4eaa15f](https://github.com/displayeo/core-api/commit/4eaa15fdd374469219273c2df7ad2028c80251f4))
* **user:** new update password endpoint ([#9](https://github.com/displayeo/core-api/issues/9)) ([747dcfe](https://github.com/displayeo/core-api/commit/747dcfe432451bbedda5f7deb1e60ae129ef8a3b))
* **workspace:** add endpoint get for runner ([#10](https://github.com/displayeo/core-api/issues/10)) ([c1536d4](https://github.com/displayeo/core-api/commit/c1536d4df987a98eedcd0c245cc17ffca653dbe3))
* **workspace:** add invitations count to workspace list ([eacc307](https://github.com/displayeo/core-api/commit/eacc30790519532fa725c6cccf41de0a23b3654b))

# 1.0.0 (2023-05-25)


### Bug Fixes

* add env sample with empty variables ([533f29a](https://github.com/displayeo/core-api/commit/533f29a1ce20931eda1f4d2e8189ea093e4d830f))
* **api:** take into account js ([5180688](https://github.com/displayeo/core-api/commit/5180688c0ff04ac53c8e6cd19739c28133a95d1b))
* **auth:** add jwt decoded type ([ac35cd1](https://github.com/displayeo/core-api/commit/ac35cd1bc33eaef6269c7c719b7ff834e8df3689))
* **ci:** check on PR develop and main ([5c437c1](https://github.com/displayeo/core-api/commit/5c437c116cd682cf29cf0cb25803af3293eca9a3))
* **ci:** remove npmrc ([c3af30a](https://github.com/displayeo/core-api/commit/c3af30af79e7d2ccbd2b3815d9e94eb68fe66dc3))
* **company:** add more control to company creation ([a4b65fc](https://github.com/displayeo/core-api/commit/a4b65fccccdf8c4f757657d3c39790e6b77de89f))
* **core:** add admin and runner folders ([117306d](https://github.com/displayeo/core-api/commit/117306d6ff4441e2d2b5a7404773d405def0c22f))
* **core:** fix package ([11e31a9](https://github.com/displayeo/core-api/commit/11e31a9f42c58b0d3b1182379a5c68c79eef9862))
* **core:** fix typo dislayeo ([bdc5cd7](https://github.com/displayeo/core-api/commit/bdc5cd74b3e3d977c9dd9293664e90e6981aa585))
* **core:** log endpoints ([7cb6769](https://github.com/displayeo/core-api/commit/7cb6769fce3965148f68dd832e83a83db0135507))
* **core:** router accept same name for file and folder ([cfe5a47](https://github.com/displayeo/core-api/commit/cfe5a47829c54e33f448df357037d21a80958385))
* **core:** router accept same name for file and folder ([6149ca8](https://github.com/displayeo/core-api/commit/6149ca855bf613d955137891a00a32381b830104))
* **invitation:** remove email from body ([90186ec](https://github.com/displayeo/core-api/commit/90186ecce6702851c0f29316b880cb208bb60f18))
* **jwt:** add id instead of name ([8672f54](https://github.com/displayeo/core-api/commit/8672f54622a36e0248810c0298c3793bf2ffdd3c))
* **jwt:** replace name by id for access jwt ([eac138d](https://github.com/displayeo/core-api/commit/eac138dcc94cb7b92e4915277a4b8d384c8b4d3b))
* **login:** refreshToken typo ([61325b9](https://github.com/displayeo/core-api/commit/61325b9fe99eb64e806e723246a7ac17b7e19023))
* **models:** rename team as workspace and token as tokenPassword ([e0232fd](https://github.com/displayeo/core-api/commit/e0232fd664f429a6051b60f39c67b76ec01b93a0))
* **password:** add /public/token/:id to check if the token is valid ([7fdc075](https://github.com/displayeo/core-api/commit/7fdc0759282221fba1684e45b23b4f598e507deb))
* **signup:** add signup endpoint ([fab26a7](https://github.com/displayeo/core-api/commit/fab26a7ed9a1fba00846577b27382d59adcab3d3))
* **signup:** add signup endpoint - missing welcome mail ([95eb2da](https://github.com/displayeo/core-api/commit/95eb2dace1d52f9bfed397dccb9c51068d643cf5))
* **user:** change jobTitle and jobType ([3114001](https://github.com/displayeo/core-api/commit/31140015de6fe39104d0e8da4bef899f3dca5756))
* **workspace:** add permissions control ([a82422a](https://github.com/displayeo/core-api/commit/a82422a8d86b0b5a30220f59afcdc48f1b4d4eaf))
* **workspace:** regenerate tokens when switch workspace ([22f5123](https://github.com/displayeo/core-api/commit/22f5123df73d5a248f186667e88d001cf02bc161))


### Features

* **auth:** add refresh token endpoint ([b28fa4d](https://github.com/displayeo/core-api/commit/b28fa4d2c2387d3f561daacb0ff0982dec541cf2))
* **auth:** use different secret for the refresh token ([519afd1](https://github.com/displayeo/core-api/commit/519afd1d33e851cb48b712cc5c0f91d89f4c6e3f))
* **company:** setting company  endpoint ([8d817e9](https://github.com/displayeo/core-api/commit/8d817e95b3bb9785022e43748ddc7f465ad346c7))
* **forgot:** setting forgot password endpoint ([38c2cbc](https://github.com/displayeo/core-api/commit/38c2cbcf51ada19040dd3f961e5cdca5ffbfcbff))
* **invitation:** setting invitation endpoint ([090bcfd](https://github.com/displayeo/core-api/commit/090bcfde42540cdbe1e569e39ff0822ce04ded68))
* **reset:** setting reset password endpoint ([faba897](https://github.com/displayeo/core-api/commit/faba897ed3c5d7b2d551484621ba24f9e7ada252))
* **signup:** add contact to mailjet and send welcome mail ([1c6ab7a](https://github.com/displayeo/core-api/commit/1c6ab7a9eef31a3bf27db5ff73e20555f2b93178))
* **team:** setting teams endpoint ([6091f7f](https://github.com/displayeo/core-api/commit/6091f7f8b016b6f51e898440c61898cba641f7a1))
* **teamuser:** setting teams membership endpoint ([ef95343](https://github.com/displayeo/core-api/commit/ef95343a6c57a1eeadd584ea5296d544e3580af7))
* **transaction:** adding a new function to run transactions easily ([4eaa15f](https://github.com/displayeo/core-api/commit/4eaa15fdd374469219273c2df7ad2028c80251f4))
* **user:** new update password endpoint ([#9](https://github.com/displayeo/core-api/issues/9)) ([747dcfe](https://github.com/displayeo/core-api/commit/747dcfe432451bbedda5f7deb1e60ae129ef8a3b))
* **workspace:** add endpoint get for runner ([#10](https://github.com/displayeo/core-api/issues/10)) ([c1536d4](https://github.com/displayeo/core-api/commit/c1536d4df987a98eedcd0c245cc17ffca653dbe3))
* **workspace:** add invitations count to workspace list ([eacc307](https://github.com/displayeo/core-api/commit/eacc30790519532fa725c6cccf41de0a23b3654b))

## [1.0.2](https://github.com/displayeo/core-api/compare/1.0.1...1.0.2) (2023-05-06)

### Bug Fixes

- **auth:** add jwt decoded type ([7e6ed8a](https://github.com/displayeo/core-api/commit/7e6ed8ad8e178cd779315b636c2077e103abdda8))

## [1.0.1](https://github.com/displayeo/core-api/compare/1.0.0...1.0.1) (2023-05-06)

### Bug Fixes

- **ci:** check on PR develop and main ([627ea0d](https://github.com/displayeo/core-api/commit/627ea0dfd1cc2acf78e50411ca2dc62ee0d03251))

# 1.0.0 (2023-05-05)

### Bug Fixes

- **api:** take into account js ([44264b7](https://github.com/displayeo/core-api/commit/44264b7b37e59f34503c96f1c0126abfa3c6a074))
- **company:** add more control to company creation ([b9cd2b5](https://github.com/displayeo/core-api/commit/b9cd2b5a82299d410671f625cca89b1a6e0cb5c3))
- **core:** add admin and runner folders ([666b6c5](https://github.com/displayeo/core-api/commit/666b6c5321070161e537b491ab2f561fc758b821))
- **core:** fix package ([ec02a68](https://github.com/displayeo/core-api/commit/ec02a68076d79164b69a2d3ad92a6f89b5d414bb))
- **core:** fix typo dislayeo ([93ba661](https://github.com/displayeo/core-api/commit/93ba661e7b7befb4d155229df16e5ae2cb3541e7))
- **core:** log endpoints ([13b71cb](https://github.com/displayeo/core-api/commit/13b71cb03c7cf3ebc871ddcbb785959418d32c43))
- **core:** router accept same name for file and folder ([bc51723](https://github.com/displayeo/core-api/commit/bc51723bf13d375050a723da209182d307280a7d))
- **core:** router accept same name for file and folder ([29c5ae0](https://github.com/displayeo/core-api/commit/29c5ae059d26aa1236e5577a0b102be76b82ae6f))
- **invitation:** remove email from body ([fc1df35](https://github.com/displayeo/core-api/commit/fc1df35559280367260a14829db28797550b3b36))
- **jwt:** add id instead of name ([98d49f9](https://github.com/displayeo/core-api/commit/98d49f984ef7dc008d702db7e0a58d33dc82ecaf))
- **jwt:** replace name by id for access jwt ([0a96bc6](https://github.com/displayeo/core-api/commit/0a96bc661cc79b497ec7401ead5c8878ffd5e0a6))
- **login:** refreshToken typo ([f3408bd](https://github.com/displayeo/core-api/commit/f3408bdf70218680aae7139e3f46b07695f017a9))
- **models:** rename team as workspace and token as tokenPassword ([cde974a](https://github.com/displayeo/core-api/commit/cde974afd0e4f507c02590392be9ed6b3a1976f6))
- **password:** add /public/token/:id to check if the token is valid ([5fc2d70](https://github.com/displayeo/core-api/commit/5fc2d70ac2d0fbef0a327b4c712a9c377c0380dd))
- **signup:** add signup endpoint ([d0dc1c6](https://github.com/displayeo/core-api/commit/d0dc1c61644dd60634ffb8b21ad9111da6edc80b))
- **signup:** add signup endpoint - missing welcome mail ([d99226a](https://github.com/displayeo/core-api/commit/d99226adbad3e7607bd93ef7e0fc08f6d3573126))
- **user:** change jobTitle and jobType ([413334f](https://github.com/displayeo/core-api/commit/413334fd049fbbf480aa4138a2d7adc5a0c01c76))
- **workspace:** add permissions control ([81d8b4f](https://github.com/displayeo/core-api/commit/81d8b4f56d440c222f75bb8061203c5a44260ab9))
- **workspace:** regenerate tokens when switch workspace ([c6b11fa](https://github.com/displayeo/core-api/commit/c6b11fadf388968398fa78cddce09515e94d8e4f))

### Features

- **auth:** add refresh token endpoint ([167d36a](https://github.com/displayeo/core-api/commit/167d36a95c4371aaff0b82d661a71edd81003c01))
- **auth:** use different secret for the refresh token ([786f0f4](https://github.com/displayeo/core-api/commit/786f0f420a4921ef062d9b248a1f46d459c9cfcf))
- **company:** setting company endpoint ([bb35dae](https://github.com/displayeo/core-api/commit/bb35dae68abd086c60e89461e8cf88cbba392be1))
- **forgot:** setting forgot password endpoint ([edffa39](https://github.com/displayeo/core-api/commit/edffa390c031955da9342882bf0c1615375ab5bb))
- **invitation:** setting invitation endpoint ([5eabb60](https://github.com/displayeo/core-api/commit/5eabb60a43f26083fe1ae181f5ee5bd59a3ed347))
- **reset:** setting reset password endpoint ([b3611a6](https://github.com/displayeo/core-api/commit/b3611a6383128896b8e3d656f127f17be6dfb188))
- **signup:** add contact to mailjet and send welcome mail ([ebc34a6](https://github.com/displayeo/core-api/commit/ebc34a613e2b2fb3bffd00f7ef1b7109a48de844))
- **team:** setting teams endpoint ([1e1eca7](https://github.com/displayeo/core-api/commit/1e1eca767309ba3913bc9ebd73c4d12955a4d6fa))
- **teamuser:** setting teams membership endpoint ([44d7e70](https://github.com/displayeo/core-api/commit/44d7e705b94c8b1c01eaa503de0f3d22b78addc4))
- **transaction:** adding a new function to run transactions easily ([ac74b04](https://github.com/displayeo/core-api/commit/ac74b049d7daf37361cee6784a1737c49857ce75))
