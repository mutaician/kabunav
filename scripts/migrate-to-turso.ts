// Import script to migrate data from local SQLite backup to Turso
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const insertStatements = [
  // Users (must be first due to foreign keys)
  `INSERT INTO users VALUES('lecturer_001','dr.mutua@kabarak.ac.ke','Dr. John Mutua','lecturer',1771669687,NULL)`,
  `INSERT INTO users VALUES('lecturer_002','prof.wanjiku@kabarak.ac.ke','Prof. Mary Wanjiku','lecturer',1771669687,NULL)`,
  `INSERT INTO users VALUES('student_001','brian.kimani@students.kabarak.ac.ke','Brian Kimani','student',1771669687,NULL)`,
  `INSERT INTO users VALUES('student_002','faith.achieng@students.kabarak.ac.ke','Faith Achieng','student',1771669687,NULL)`,
  `INSERT INTO users VALUES('student_003','james.odhiambo@students.kabarak.ac.ke','James Odhiambo','student',1771669687,NULL)`,
  `INSERT INTO users VALUES('user_39yOdEGofNXrRVQG1e2Kif7FcBy','cyprianmutai5900@gmail.com','Cyprian Kiplangat','lecturer',1771669734,NULL)`,
  `INSERT INTO users VALUES('user_39yNnHjpu1gCuoZcfg9q3F6io4h','cypriankiplangat@kabarak.ac.ke','Cyprian Kiplangat','student',1771669786,'+254724764967')`,
  
  // Venues
  `INSERT INTO venues VALUES('7b75151b-139d-4a21-911c-88ed273d8647','Admin Block - Room A101','Main Administration Block',1,-0.1664799999999999892,35.96491000000000327,'Main administration building, first floor lecture room')`,
  `INSERT INTO venues VALUES('fc2338c6-f604-491f-aaf1-e154e446033d','Library Hall - L1','Margaret Thatcher Library',0,-0.1670999999999999986,35.96589999999999777,'Ground floor lecture hall in the library building')`,
  `INSERT INTO venues VALUES('d9a37914-a340-4ca6-a818-43209c691ab3','Science Lab - S201','School of Science & Technology',2,-0.1658000000000000029,35.96520000000000295,'Computer science laboratory, second floor')`,
  `INSERT INTO venues VALUES('6ef11f66-2621-45a2-83d8-1a7d8c6cb641','Business Hall - B102','School of Business & Economics',1,-0.1668000000000000038,35.96419999999999817,'Main lecture hall for business courses')`,
  `INSERT INTO venues VALUES('577c75dd-11d2-4615-b157-3d2e35999656','Chapel Annex - C1','University Chapel',0,-0.1655000000000000082,35.96600000000000108,'Chapel annex used for large gatherings and lectures')`,
  
  // Courses
  `INSERT INTO courses VALUES('55b2f56d-02bb-4468-b320-7ea9846ec316','CS 101','Introduction to Computer Science','lecturer_001')`,
  `INSERT INTO courses VALUES('b798681a-c717-414f-b302-cd782bbf560c','CS 201','Data Structures and Algorithms','lecturer_001')`,
  `INSERT INTO courses VALUES('30d02070-773d-4259-b729-583b56da97c8','BUS 101','Introduction to Business','lecturer_002')`,
  `INSERT INTO courses VALUES('a25b9980-8f9d-4b7f-a272-894cf2b8aced','MTH 201','Calculus II','lecturer_002')`,
  `INSERT INTO courses VALUES('ac0db679-b869-4f5d-b1a3-a563bb42ac2f','INTE 122','Database ','user_39yOdEGofNXrRVQG1e2Kif7FcBy')`,
  `INSERT INTO courses VALUES('50ae1ab5-e403-4e90-bf62-4f046ca5197a','INTE 232','Data structures','user_39yOdEGofNXrRVQG1e2Kif7FcBy')`,
  `INSERT INTO courses VALUES('1af1b036-6262-4ce4-8476-3c01c8e3ef33','INTE 235','AI ','user_39yOdEGofNXrRVQG1e2Kif7FcBy')`,
  
  // Class sessions
  `INSERT INTO class_sessions VALUES('5dbcc4ec-b3f8-47cb-ae35-6ae3fab51612','55b2f56d-02bb-4468-b320-7ea9846ec316','2026-02-21','08:00','10:00','d9a37914-a340-4ca6-a818-43209c691ab3','confirmed',1771669687,NULL)`,
  `INSERT INTO class_sessions VALUES('a58fe7e9-c6c2-4661-8f0f-4c776fa717ee','b798681a-c717-414f-b302-cd782bbf560c','2026-02-21','10:30','12:30','d9a37914-a340-4ca6-a818-43209c691ab3','pending',NULL,NULL)`,
  `INSERT INTO class_sessions VALUES('6a35a102-d327-4ba2-8961-2766eff7dfe6','30d02070-773d-4259-b729-583b56da97c8','2026-02-21','14:00','16:00','6ef11f66-2621-45a2-83d8-1a7d8c6cb641','cancelled',1771669687,'Lecturer attending a conference')`,
  `INSERT INTO class_sessions VALUES('803054c5-0e94-49e3-b5ec-eb047c1c0aee','a25b9980-8f9d-4b7f-a272-894cf2b8aced','2026-02-21','16:30','18:00','fc2338c6-f604-491f-aaf1-e154e446033d','pending',NULL,NULL)`,
  `INSERT INTO class_sessions VALUES('58b362c5-43ae-43c3-a03c-ada95b9af30e','ac0db679-b869-4f5d-b1a3-a563bb42ac2f','2026-02-21','13:30','13:30','7b75151b-139d-4a21-911c-88ed273d8647','confirmed',1771669775,NULL)`,
  `INSERT INTO class_sessions VALUES('ae5c9b8d-fc92-4886-8886-1576f59bfda3','50ae1ab5-e403-4e90-bf62-4f046ca5197a','2026-02-21','14:00','15:00','7b75151b-139d-4a21-911c-88ed273d8647','cancelled',1771671491,'emergency meeting')`,
  `INSERT INTO class_sessions VALUES('23ee478c-e488-4709-a600-ab19e9d50f6f','1af1b036-6262-4ce4-8476-3c01c8e3ef33','2026-02-21','14:31','15:31','fc2338c6-f604-491f-aaf1-e154e446033d','cancelled',1771677752,'conference')`,
  
  // Enrollments
  `INSERT INTO enrollments VALUES('7037a31f-2f7a-4913-85b0-36504513464e','student_001','55b2f56d-02bb-4468-b320-7ea9846ec316')`,
  `INSERT INTO enrollments VALUES('f85ea910-7890-4b19-bce5-a3dd313ae446','student_001','b798681a-c717-414f-b302-cd782bbf560c')`,
  `INSERT INTO enrollments VALUES('c3b960d7-88e5-48cd-a337-2deb93ef14df','student_001','a25b9980-8f9d-4b7f-a272-894cf2b8aced')`,
  `INSERT INTO enrollments VALUES('0912ef15-396b-4337-8d28-78f8f1f8e750','student_002','55b2f56d-02bb-4468-b320-7ea9846ec316')`,
  `INSERT INTO enrollments VALUES('d92b32b5-8599-4f2a-aaad-99423cce05c0','student_002','b798681a-c717-414f-b302-cd782bbf560c')`,
  `INSERT INTO enrollments VALUES('172415c6-a3a3-4094-be44-762f6ea68de4','student_002','30d02070-773d-4259-b729-583b56da97c8')`,
  `INSERT INTO enrollments VALUES('8e4bd120-0ce8-4acf-8bc0-8e5410f1d20f','student_002','a25b9980-8f9d-4b7f-a272-894cf2b8aced')`,
  `INSERT INTO enrollments VALUES('12e5b0c6-9baa-4852-91ce-e7bac7fc9a48','student_003','30d02070-773d-4259-b729-583b56da97c8')`,
  `INSERT INTO enrollments VALUES('79a13ce8-3041-42ff-9fe3-abfe90242bd9','student_003','a25b9980-8f9d-4b7f-a272-894cf2b8aced')`,
  `INSERT INTO enrollments VALUES('ceda1a37-6f63-43ee-89fb-fbcd06f9856b','user_39yNnHjpu1gCuoZcfg9q3F6io4h','ac0db679-b869-4f5d-b1a3-a563bb42ac2f')`,
  `INSERT INTO enrollments VALUES('d6ffc4de-c595-4ec6-ab7b-d2a88ed2ce59','user_39yNnHjpu1gCuoZcfg9q3F6io4h','50ae1ab5-e403-4e90-bf62-4f046ca5197a')`,
  `INSERT INTO enrollments VALUES('11ee3dde-e792-496b-9828-dc79b22dae35','user_39yNnHjpu1gCuoZcfg9q3F6io4h','1af1b036-6262-4ce4-8476-3c01c8e3ef33')`,
];

async function migrate() {
  console.log("Starting migration to Turso...");
  
  let success = 0;
  let failed = 0;
  
  for (const sql of insertStatements) {
    try {
      await client.execute(sql);
      success++;
      console.log(`✓ Inserted row ${success}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Ignore duplicate key errors (data already exists)
      if (err.message?.includes("UNIQUE constraint failed") || err.message?.includes("SQLITE_CONSTRAINT")) {
        console.log(`⚠ Skipped (already exists): ${sql.substring(0, 50)}...`);
      } else {
        console.error(`✗ Failed: ${sql.substring(0, 50)}...`);
        console.error(`  Error: ${err.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\nMigration complete: ${success} inserted, ${failed} failed`);
}

migrate().catch(console.error);
