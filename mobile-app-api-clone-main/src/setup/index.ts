import 'dotenv/config';
import { Types } from 'mongoose';
import initializeDb from '@/db';
import { workspace, user, device, battery } from '@/models';
import { IWorkspaceModelWithId } from '@/models/workspace';
import { IUserModel } from '@/models/user';
import { IBatteryModelWithId } from '@/models/battery';
import { encryptPassword } from '@/lib/encode';

/**
 * Setup script to inject master data
 * Creates a master user called 'Batari Admin', a workspace named 'Kantor', a device named 'B012026',
 * and a battery named 'B012026', all with hardcoded ObjectIDs.
 */
async function setupMasterData() {
  try {
    console.log('Starting setup script...');

    // Initialize database connection
    const db = await initializeDb();
    if (!db) {
      throw new Error('Failed to connect to database. Please check MONGO_URI environment variable.');
    }
    console.log('Database connected successfully');

    // Hardcoded ObjectIDs for the fixtures
    const batariAdminUserId = new Types.ObjectId('507f1f77bcf86cd799439000');
    const kantorWorkspaceId = new Types.ObjectId('507f1f77bcf86cd799439011');
    const testDeviceId = new Types.ObjectId('507f1f77bcf86cd799439055');
    const testBatteryId = new Types.ObjectId('507f1f77bcf86cd799439070');

    // --- Create Batari Admin user ---
    const existingMasterUser = await user.get<IUserModel>(batariAdminUserId);

    let createdMasterUser: IUserModel | undefined;
    if (existingMasterUser) {
      createdMasterUser = existingMasterUser;
      console.log(`User 'Batari Admin' already exists with ID: ${batariAdminUserId.toHexString()}`);
    } else {
      // Prepare Batari Admin user payload
      const masterUserPayload = {
        _id: batariAdminUserId,
        name: 'Batari Admin',
        email: 'admin@batari.asia',
        role: 'admin',
        isActive: true,
        password: await encryptPassword('password')
      };

      createdMasterUser = await user.create<IUserModel>(masterUserPayload);

      // Only display fields known to exist: name, email, isActive, (use _id from create payload)
      console.log('✓ User "Batari Admin" created successfully!');
      console.log(`  ID: ${batariAdminUserId.toHexString()}`);
      console.log(`  Name: ${createdMasterUser.name}`);
      console.log(`  Email: ${createdMasterUser.email}`);
      console.log(`  Role: ${masterUserPayload.role}`);
    }

    // --- Create 'Kantor' workspace ---
    const existingWorkspace = await workspace.get<IWorkspaceModelWithId>(kantorWorkspaceId);

    let createdWorkspace: IWorkspaceModelWithId | undefined;
    if (existingWorkspace) {
      createdWorkspace = existingWorkspace;
      console.log(`Workspace 'Kantor' already exists with ID: ${kantorWorkspaceId.toHexString()}`);
    } else {
      let ownerId = process.env.WORKSPACE_OWNER_ID;

      if (!ownerId) {
        ownerId = batariAdminUserId.toHexString();
        console.log(`WORKSPACE_OWNER_ID env not set. Using Batari Admin user as owner (ID: ${ownerId})`);
      }
      if (!Types.ObjectId.isValid(ownerId)) {
        throw new Error(`Invalid WORKSPACE_OWNER_ID: ${ownerId}. Must be a valid MongoDB ObjectID.`);
      }
      const workspacePayload = {
        _id: kantorWorkspaceId,
        name: 'Kantor',
        timezone: process.env.WORKSPACE_TIMEZONE || 'Asia/Jakarta',
        ownerId: new Types.ObjectId(ownerId),
        language: process.env.WORKSPACE_LANGUAGE || 'id',
        isDefault: false,
        members: []
      };
      createdWorkspace = await workspace.create<IWorkspaceModelWithId>(workspacePayload);

      console.log('✓ Workspace "Kantor" created successfully!');
      console.log(`  ID: ${kantorWorkspaceId.toHexString()}`);
      console.log(`  Name: ${createdWorkspace.name}`);
      console.log(`  Timezone: ${createdWorkspace.timezone}`);
      console.log(`  Owner ID: ${createdWorkspace.ownerId instanceof Types.ObjectId ? createdWorkspace.ownerId.toHexString() : createdWorkspace.ownerId}`);
    }

    // --- Create battery 'B012026' ---
    // See @file_context_1 for fields; only required field is name, brand is optional
    const existingBattery = await battery.model.findOne({ _id: testBatteryId });
    let createdBattery: IBatteryModelWithId | undefined;
    if (existingBattery) {
      createdBattery = existingBattery;
      console.log(`Battery 'B012026' already exists with ID: ${testBatteryId.toHexString()}`);
    } else {
      const batteryPayload = {
        _id: testBatteryId,
        name: 'B012026',
        description: 'Initial setup battery',
        brand: 'Batari',
        uuid: 'B012026', // unique string identifier
        maxPowerOutput: 5000,
        capacity: 20, // Example in MWh
        voltage: 400,
        internalResistance: 0.2,
        selfDischargeRate: 1.5,
        operatingTemperatureRange: { min: -20, max: 60 },
        width: 0.4,
        height: 0.9,
        length: 0.35,
        weight: 85,
        material: 'lithium-ion',
        warrantyInMonths: 36,
        weatherResistanceRating: 'IP65'
      };
      createdBattery = await battery.model.create(batteryPayload);

      console.log('✓ Battery "B012026" created successfully!');
      console.log(`  ID: ${createdBattery._id instanceof Types.ObjectId ? createdBattery._id.toHexString() : createdBattery._id}`);
      console.log(`  Name: ${createdBattery.name}`);
      console.log(`  Brand: ${createdBattery.brand}`);
    }

    // --- Create device 'B012026' ---
    // Only add if this workspace was just created; skip otherwise.
    const existingDevice = await device.model.findOne({ _id: testDeviceId });
    if (existingDevice) {
      console.log(`Device 'B012026' already exists with ID: ${testDeviceId.toHexString()}`);
    } else {
      if (!createdWorkspace?._id) {
        throw new Error('Cannot create device: workspace _id not found!');
      }
      // Attach battery reference by ObjectId and uuid
      const devicePayload = {
        _id: testDeviceId,
        name: 'Main Device',
        description: 'Initial setup device',
        isDefault: true,
        workspace: createdWorkspace._id,
        brand: 'Batari',
        batteries: [{ batteryId: testBatteryId, uuid: 'BAT-B012026' }],
        panels: [],
        inverters: []
        // Other fields can be filled with defaults as needed
      };
      const createdDevice = await device.model.create(devicePayload);

      console.log('✓ Device "B012026" created successfully!');
      console.log(`  ID: ${createdDevice._id instanceof Types.ObjectId ? createdDevice._id.toHexString() : createdDevice._id}`);
      console.log(`  Name: ${createdDevice.name}`);
      console.log(`  Workspace: ${createdDevice.workspace instanceof Types.ObjectId ? createdDevice.workspace.toHexString() : createdDevice.workspace}`);
      console.log(`  Batteries: ${JSON.stringify(createdDevice.batteries)}`);
    }

    // Close database connection
    await db.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupMasterData();
