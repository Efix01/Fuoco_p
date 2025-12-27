
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing Supabase Connection...");
    console.log("URL:", supabaseUrl);

    const testOp = {
        name: "Test Script User",
        role: "Operatore",
        total_hours: 1
    };

    console.log("Attempting insert:", testOp);

    const { data, error } = await supabase
        .from('operators')
        .insert([testOp])
        .select();

    if (error) {
        console.error("INSERT FAILED:", error);
    } else {
        console.log("INSERT SUCCESS:", data);
    }

    // Cleanup
    if (data && data.length > 0) {
        const id = data[0].id;
        console.log("Cleaning up...", id);
        const { error: delError } = await supabase.from('operators').delete().eq('id', id);
        if (delError) console.error("Cleanup failed:", delError);
        else console.log("Cleanup success.");
    }
}

testInsert();
