/**
 * Firebase Auth User Cleanup Script
 * Deletes ALL Firebase Auth users EXCEPT the specified demo user.
 *
 * Prerequisites:
 * 1. Download Firebase Admin SDK service account key from Firebase Console
 *    (Project Settings → Service Accounts → Generate New Private Key)
 * 2. Save it as firebase-admin-key.json in the project root
 * 3. Set DEMO_USER_UID environment variable to the UID you want to keep
 *
 * Usage:
 *   DEMO_USER_UID=<demo-uid> node scripts/cleanup-firebase-users.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_PATH = path.resolve('firebase-admin-key.json');
const DEMO_USER_UID = process.env.DEMO_USER_UID || 'guest_dev_user';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(
    `\n❌ Firebase Admin service account key not found at: ${SERVICE_ACCOUNT_PATH}\n` +
    'Please download it from Firebase Console → Project Settings → Service Accounts → Generate New Private Key\n'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

async function listAndDeleteUsers() {
  console.log(`\n🔍 Listing Firebase Auth users...`);
  console.log(`🛡️  Demo user to keep (UID): ${DEMO_USER_UID}\n`);

  let deletedCount = 0;
  let errorCount = 0;
  let keptCount = 0;
  let pageToken;

  do {
    const listUsersResult = await auth.listUsers(1000, pageToken);
    const users = listUsersResult.users;

    if (users.length === 0) {
      console.log('✅ No more users found.');
      break;
    }

    console.log(`   Found ${users.length} users in this batch.`);

    for (const userRecord of users) {
      if (userRecord.uid === DEMO_USER_UID) {
        console.log(`   ⏭️  KEEPING: ${userRecord.email || 'no email'} (${userRecord.uid})`);
        keptCount++;
        continue;
      }

      try {
        await auth.deleteUser(userRecord.uid);
        console.log(`   🗑️  DELETED: ${userRecord.email || 'no email'} (${userRecord.uid})`);
        deletedCount++;
      } catch (err) {
        console.error(`   ❌ FAILED to delete ${userRecord.email || userRecord.uid}: ${err.message}`);
        errorCount++;
      }
    }

    pageToken = listUsersResult.pageToken;
  } while (pageToken);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Cleanup complete!`);
  console.log(`   Users kept:   ${keptCount}`);
  console.log(`   Users deleted: ${deletedCount}`);
  console.log(`   Errors:        ${errorCount}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

listAndDeleteUsers().catch((err) => {
  console.error('💥 Script failed:', err);
  process.exit(1);
});