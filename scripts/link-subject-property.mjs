import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function linkSubjectProperty() {
  try {
    console.log('🔍 Finding appraisals without subject property...\n');

    // Find appraisals without a subject_property_id
    const { data: appraisals, error: appraisalsError } = await supabase
      .from('appraisals')
      .select('id, appraisal_number, address, client_name')
      .is('subject_property_id', null)
      .limit(10);

    if (appraisalsError) {
      console.error('❌ Error fetching appraisals:', appraisalsError);
      return;
    }

    if (!appraisals || appraisals.length === 0) {
      console.log('✅ All appraisals already have a subject property linked!');
      return;
    }

    console.log(`Found ${appraisals.length} appraisal(s) without subject property:\n`);
    appraisals.forEach((a, i) => {
      console.log(`${i + 1}. ${a.appraisal_number || 'No number'} - ${a.address || 'No address'} (${a.client_name || 'No client'})`);
      console.log(`   ID: ${a.id}\n`);
    });

    // Get some properties from the library
    console.log('🏠 Fetching properties from library...\n');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, adresse, ville, province')
      .limit(10);

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('❌ No properties found in library. Please add properties first.');
      return;
    }

    console.log(`Found ${properties.length} property(ies) in library:\n`);
    properties.forEach((p, i) => {
      const address = [p.adresse, p.ville, p.province].filter(Boolean).join(', ');
      console.log(`${i + 1}. ${address || 'No address'}`);
      console.log(`   ID: ${p.id}\n`);
    });

    // Link the first appraisal to the first property
    const appraisalToLink = appraisals[0];
    const propertyToLink = properties[0];

    console.log(`\n🔗 Linking appraisal "${appraisalToLink.appraisal_number || appraisalToLink.id}" to property "${[propertyToLink.adresse, propertyToLink.ville].filter(Boolean).join(', ')}"`);

    const { error: updateError } = await supabase
      .from('appraisals')
      .update({ subject_property_id: propertyToLink.id })
      .eq('id', appraisalToLink.id);

    if (updateError) {
      console.error('❌ Error linking property:', updateError);
      return;
    }

    console.log('\n✅ Successfully linked subject property!');
    console.log(`\nAppraisal ID: ${appraisalToLink.id}`);
    console.log(`Property ID: ${propertyToLink.id}`);
    console.log('\n💡 Refresh your browser to see the subject property data in the Direct Comparison form.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

linkSubjectProperty();
