# alembic/versions/xxxx_add_source_station_parameter_to_alerts.py

from alembic import op
import sqlalchemy as sa


def upgrade():
    # 1. Add 'predictive' to existing alerttype enum
    op.execute("ALTER TYPE alerttype ADD VALUE IF NOT EXISTS 'predictive'")

    # 2. Create new alertsource enum
    op.execute("CREATE TYPE alertsource AS ENUM ('manual', 'predictive')")

    # 3. Add source column
    op.add_column('alerts',
        sa.Column(
            'source',
            sa.Enum('manual', 'predictive', name='alertsource'),
            nullable=False,
            server_default='manual'
        )
    )

    # 4. Add station_id column
    op.add_column('alerts',
        sa.Column(
            'station_id',
            sa.Integer(),
            sa.ForeignKey('stations.id'),
            nullable=True
        )
    )

    # 5. Add parameter column
    op.add_column('alerts',
        sa.Column(
            'parameter',
            sa.String(),
            nullable=True
        )
    )


def downgrade():
    op.drop_column('alerts', 'parameter')
    op.drop_column('alerts', 'station_id')
    op.drop_column('alerts', 'source')
    op.execute("DROP TYPE alertsource")


