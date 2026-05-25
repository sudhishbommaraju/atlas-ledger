import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/insforge/server';
import { POLICY_PRESETS } from '@/lib/policy/engine';

export async function GET(req: NextRequest) {
  const insforge = createServerClient();
  const { searchParams } = new URL(req.url);
  const company_id = searchParams.get('company_id');

  if (!company_id) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

  const { data, error } = await insforge.database
    .from('policies').select('*').eq('company_id', company_id).limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return NextResponse.json({
      policy_name: 'standard',
      rules: POLICY_PRESETS.standard,
      is_default: true,
    });
  }

  return NextResponse.json(data[0]);
}

export async function POST(req: NextRequest) {
  const insforge = createServerClient();
  const body = await req.json();
  const { company_id, policy_name, rules } = body;

  if (!company_id || !policy_name) {
    return NextResponse.json({ error: 'company_id and policy_name required' }, { status: 400 });
  }

  const finalRules = policy_name === 'custom' ? rules : POLICY_PRESETS[policy_name] ?? POLICY_PRESETS.standard;

  const { data: existing } = await insforge.database
    .from('policies').select('id').eq('company_id', company_id).limit(1);

  const now = new Date().toISOString();

  if (existing && existing.length > 0) {
    const { data, error } = await insforge.database
      .from('policies')
      .update({ policy_name, rules: finalRules, updated_at: now })
      .eq('company_id', company_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await insforge.database
    .from('policies')
    .insert({ company_id, policy_name, rules: finalRules })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
