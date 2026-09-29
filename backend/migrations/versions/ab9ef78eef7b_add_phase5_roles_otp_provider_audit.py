"""add_phase5_roles_otp_provider_audit

Revision ID: ab9ef78eef7b
Revises: e61a31691c6a
Create Date: 2026-09-29 14:54:15.430786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab9ef78eef7b'
down_revision: Union[str, Sequence[str], None] = 'e61a31691c6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Create otp_verifications table if not present
    if 'otp_verifications' not in existing_tables:
        op.create_table(
            'otp_verifications',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('phone', sa.String(length=20), nullable=False),
            sa.Column('otp_code', sa.String(length=10), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('is_used', sa.Boolean(), nullable=False, server_default='0'),
            sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('otp_verifications', schema=None) as batch_op:
            batch_op.create_index('ix_otp_verifications_id', ['id'], unique=False)
            batch_op.create_index('ix_otp_verifications_phone', ['phone'], unique=False)

    # 2. Create training_batches table if not present
    if 'training_batches' not in existing_tables:
        op.create_table(
            'training_batches',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('provider_id', sa.Integer(), nullable=False),
            sa.Column('batch_name', sa.String(length=255), nullable=False),
            sa.Column('qp_code', sa.String(length=50), nullable=False),
            sa.Column('qualification_name', sa.String(length=255), nullable=True),
            sa.Column('centre_name', sa.String(length=255), nullable=False),
            sa.Column('start_date', sa.String(length=50), nullable=True),
            sa.Column('end_date', sa.String(length=50), nullable=True),
            sa.Column('max_capacity', sa.Integer(), nullable=False, server_default='30'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['provider_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('training_batches', schema=None) as batch_op:
            batch_op.create_index('ix_training_batches_id', ['id'], unique=False)
            batch_op.create_index('ix_training_batches_provider_id', ['provider_id'], unique=False)
            batch_op.create_index('ix_training_batches_qp_code', ['qp_code'], unique=False)

    # 3. Create batch_enrollments table if not present
    if 'batch_enrollments' not in existing_tables:
        op.create_table(
            'batch_enrollments',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('batch_id', sa.Integer(), nullable=False),
            sa.Column('candidate_id', sa.Integer(), nullable=False),
            sa.Column('attendance_percentage', sa.Float(), nullable=False, server_default='0.0'),
            sa.Column('attendance_records', sa.JSON(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=False, server_default='enrolled'),
            sa.Column('completion_date', sa.DateTime(), nullable=True),
            sa.Column('certificate_id', sa.String(length=100), nullable=True),
            sa.Column('notes', sa.String(length=500), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['batch_id'], ['training_batches.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['candidate_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('batch_enrollments', schema=None) as batch_op:
            batch_op.create_index('ix_batch_enrollments_id', ['id'], unique=False)
            batch_op.create_index('ix_batch_enrollments_batch_id', ['batch_id'], unique=False)
            batch_op.create_index('ix_batch_enrollments_candidate_id', ['candidate_id'], unique=False)

    # 4. Alter users table
    user_cols = [c['name'] for c in inspector.get_columns('users')]
    with op.batch_alter_table('users', schema=None) as batch_op:
        if 'organisation_name' not in user_cols:
            batch_op.add_column(sa.Column('organisation_name', sa.String(length=255), nullable=True))
        if 'agent_id' not in user_cols:
            batch_op.add_column(sa.Column('agent_id', sa.Integer(), nullable=True))
            batch_op.create_index('ix_users_agent_id', ['agent_id'], unique=False)
            batch_op.create_foreign_key('fk_users_agent_id', 'users', ['agent_id'], ['id'], ondelete='SET NULL')
        batch_op.alter_column('email', existing_type=sa.VARCHAR(length=255), nullable=True)
        batch_op.alter_column('hashed_password', existing_type=sa.VARCHAR(length=255), nullable=True)

    # 5. Alter user_skills table
    skill_cols = [c['name'] for c in inspector.get_columns('user_skills')]
    with op.batch_alter_table('user_skills', schema=None) as batch_op:
        if 'verified_by_user_id' not in skill_cols:
            batch_op.add_column(sa.Column('verified_by_user_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_user_skills_verified_by', 'users', ['verified_by_user_id'], ['id'], ondelete='SET NULL')
        if 'verified_at' not in skill_cols:
            batch_op.add_column(sa.Column('verified_at', sa.DateTime(), nullable=True))
        if 'verification_notes' not in skill_cols:
            batch_op.add_column(sa.Column('verification_notes', sa.String(length=255), nullable=True))

    # 6. Alter candidate_progress table
    prog_cols = [c['name'] for c in inspector.get_columns('candidate_progress')]
    with op.batch_alter_table('candidate_progress', schema=None) as batch_op:
        if 'batch_id' not in prog_cols:
            batch_op.add_column(sa.Column('batch_id', sa.Integer(), nullable=True))
            batch_op.create_index('ix_candidate_progress_batch_id', ['batch_id'], unique=False)
            batch_op.create_foreign_key('fk_candidate_progress_batch', 'training_batches', ['batch_id'], ['id'], ondelete='SET NULL')

    # 7. Alter audit_logs table
    audit_cols = [c['name'] for c in inspector.get_columns('audit_logs')]
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        if 'actor_id' not in audit_cols:
            batch_op.add_column(sa.Column('actor_id', sa.Integer(), nullable=True))
            batch_op.create_index('ix_audit_logs_actor_id', ['actor_id'], unique=False)
            batch_op.create_foreign_key('fk_audit_logs_actor', 'users', ['actor_id'], ['id'], ondelete='SET NULL')
        if 'target_user_id' not in audit_cols:
            batch_op.add_column(sa.Column('target_user_id', sa.Integer(), nullable=True))
            batch_op.create_index('ix_audit_logs_target_user_id', ['target_user_id'], unique=False)
            batch_op.create_foreign_key('fk_audit_logs_target_user', 'users', ['target_user_id'], ['id'], ondelete='SET NULL')
        if 'ip_address' not in audit_cols:
            batch_op.add_column(sa.Column('ip_address', sa.String(length=100), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('audit_logs', schema=None) as batch_op:
        batch_op.drop_column('ip_address')
        batch_op.drop_column('target_user_id')
        batch_op.drop_column('actor_id')

    with op.batch_alter_table('candidate_progress', schema=None) as batch_op:
        batch_op.drop_column('batch_id')

    with op.batch_alter_table('user_skills', schema=None) as batch_op:
        batch_op.drop_column('verification_notes')
        batch_op.drop_column('verified_at')
        batch_op.drop_column('verified_by_user_id')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('agent_id')
        batch_op.drop_column('organisation_name')

    op.drop_table('batch_enrollments')
    op.drop_table('training_batches')
    op.drop_table('otp_verifications')
