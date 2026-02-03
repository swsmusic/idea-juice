import { NextRequest, NextResponse } from 'next/server';
import { createPhylloUser, generateSdkToken } from '@/lib/phyllo';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    // Create Phyllo user
    const phylloUser = await createPhylloUser(userId, email);

    // Generate SDK token for Phyllo Connect
    const sdkToken = await generateSdkToken(phylloUser.id);

    // Update user in Supabase with Phyllo user ID
    const { error } = await supabase
      .from('users')
      .update({ phyllo_user_id: phylloUser.id })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update user:', error);
      return NextResponse.json(
        { error: 'Failed to update user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      phylloUserId: phylloUser.id,
      sdkToken,
    });
  } catch (error: any) {
    console.error('Error creating Phyllo user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Phyllo user' },
      { status: 500 }
    );
  }
}
