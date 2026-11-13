@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <h1>Administrative Overview<small>A quick glance at your system status and resources.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Overview</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="box" style="margin-bottom: 20px;">
            <div class="box-body" style="padding: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="text-muted" style="text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Servers</span>
                        <h3 style="margin: 4px 0 2px 0; font-size: 24px; font-weight: 700;">{{ number_format($stats['servers']['total']) }}</h3>
                        <small class="text-muted">{{ $stats['servers']['active'] }} active &bull; {{ $stats['servers']['suspended'] }} suspended</small>
                    </div>
                    <div style="font-size: 28px; opacity: 0.35;">
                        <i class="fa fa-server"></i>
                    </div>
                </div>
            </div>
            <div class="box-footer" style="padding: 7px 15px; font-size: 12px; background: rgba(0,0,0,0.12); border-top: 1px solid rgba(0,0,0,0.15);">
                <a href="{{ route('admin.servers') }}">Manage Servers <i class="fa fa-arrow-circle-right pull-right" style="margin-top: 2px;"></i></a>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="box" style="margin-bottom: 20px;">
            <div class="box-body" style="padding: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="text-muted" style="text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Nodes</span>
                        <h3 style="margin: 4px 0 2px 0; font-size: 24px; font-weight: 700;">{{ number_format($stats['nodes']['total']) }}</h3>
                        <small class="text-muted">
                            @if($stats['nodes']['maintenance'] > 0)
                                <span class="text-yellow">{{ $stats['nodes']['maintenance'] }} in maintenance</span>
                            @else
                                All operational
                            @endif
                        </small>
                    </div>
                    <div style="font-size: 28px; opacity: 0.35;">
                        <i class="fa fa-sitemap"></i>
                    </div>
                </div>
            </div>
            <div class="box-footer" style="padding: 7px 15px; font-size: 12px; background: rgba(0,0,0,0.12); border-top: 1px solid rgba(0,0,0,0.15);">
                <a href="{{ route('admin.nodes') }}">Manage Nodes <i class="fa fa-arrow-circle-right pull-right" style="margin-top: 2px;"></i></a>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="box" style="margin-bottom: 20px;">
            <div class="box-body" style="padding: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="text-muted" style="text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Users</span>
                        <h3 style="margin: 4px 0 2px 0; font-size: 24px; font-weight: 700;">{{ number_format($stats['users']['total']) }}</h3>
                        <small class="text-muted">{{ $stats['users']['admins'] }} admins &bull; {{ $stats['users']['2fa'] }} 2FA</small>
                    </div>
                    <div style="font-size: 28px; opacity: 0.35;">
                        <i class="fa fa-users"></i>
                    </div>
                </div>
            </div>
            <div class="box-footer" style="padding: 7px 15px; font-size: 12px; background: rgba(0,0,0,0.12); border-top: 1px solid rgba(0,0,0,0.15);">
                <a href="{{ route('admin.users') }}">Manage Users <i class="fa fa-arrow-circle-right pull-right" style="margin-top: 2px;"></i></a>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="box" style="margin-bottom: 20px;">
            <div class="box-body" style="padding: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="text-muted" style="text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Allocations</span>
                        <h3 style="margin: 4px 0 2px 0; font-size: 24px; font-weight: 700;">{{ number_format($stats['allocations']['total']) }}</h3>
                        <small class="text-muted">{{ $stats['allocations']['assigned'] }} used &bull; {{ $stats['allocations']['free'] }} free</small>
                    </div>
                    <div style="font-size: 28px; opacity: 0.35;">
                        <i class="fa fa-hdd-o"></i>
                    </div>
                </div>
            </div>
            <div class="box-footer" style="padding: 7px 15px; font-size: 12px; background: rgba(0,0,0,0.12); border-top: 1px solid rgba(0,0,0,0.15);">
                <a href="{{ route('admin.nodes') }}">Manage Allocations <i class="fa fa-arrow-circle-right pull-right" style="margin-top: 2px;"></i></a>
            </div>
        </div>
    </div>
</div>

{{-- Global Cluster Resource Pool --}}
<div class="row">
    <div class="col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-pie-chart"></i> Global Cluster Resource Pool</h3>
                <div class="box-tools pull-right">
                    <span class="label label-default">Nodes Total Capacity vs. Server Limits</span>
                </div>
            </div>
            <div class="box-body">
                <div class="row">
                    <div class="col-md-6 col-xs-12" style="margin-bottom: 15px;">
                        <div style="margin-bottom: 6px;">
                            <strong><i class="fa fa-microchip text-muted"></i> Cluster Memory (RAM) Allocated</strong>
                            <span class="pull-right text-muted">
                                <strong>{{ $cluster['memory_allocated_human'] }}</strong> / {{ $cluster['memory_total_human'] }}
                                <span class="badge {{ $cluster['memory_percent'] > 90 ? 'bg-red' : ($cluster['memory_percent'] > 75 ? 'bg-yellow' : 'bg-green') }}" style="margin-left: 6px;">
                                    {{ $cluster['memory_percent'] }}%
                                </span>
                            </span>
                        </div>
                        <div class="progress progress-sm" style="background: rgba(0,0,0,0.25); margin-bottom: 4px;">
                            <div class="progress-bar progress-bar-{{ $cluster['memory_percent'] > 90 ? 'danger' : ($cluster['memory_percent'] > 75 ? 'warning' : 'primary') }}" style="width: {{ min(100, $cluster['memory_percent']) }}%"></div>
                        </div>
                        <small class="text-muted">Total RAM assigned across all active and stopped servers.</small>
                    </div>
                    <div class="col-md-6 col-xs-12" style="margin-bottom: 15px;">
                        <div style="margin-bottom: 6px;">
                            <strong><i class="fa fa-database text-muted"></i> Cluster Disk Space Allocated</strong>
                            <span class="pull-right text-muted">
                                <strong>{{ $cluster['disk_allocated_human'] }}</strong> / {{ $cluster['disk_total_human'] }}
                                <span class="badge {{ $cluster['disk_percent'] > 90 ? 'bg-red' : ($cluster['disk_percent'] > 75 ? 'bg-yellow' : 'bg-green') }}" style="margin-left: 6px;">
                                    {{ $cluster['disk_percent'] }}%
                                </span>
                            </span>
                        </div>
                        <div class="progress progress-sm" style="background: rgba(0,0,0,0.25); margin-bottom: 4px;">
                            <div class="progress-bar progress-bar-{{ $cluster['disk_percent'] > 90 ? 'danger' : ($cluster['disk_percent'] > 75 ? 'warning' : 'primary') }}" style="width: {{ min(100, $cluster['disk_percent']) }}%"></div>
                        </div>
                        <small class="text-muted">Total disk capacity assigned across all active servers.</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-6 col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-tag"></i> Panel Version Status</h3>
                <div class="box-tools pull-right">
                    @if ($version->isLatestPanel())
                        <span class="label label-success">Up to Date</span>
                    @else
                        <span class="label label-danger">Update Available</span>
                    @endif
                </div>
            </div>
            <div class="box-body">
                @if ($version->isLatestPanel())
                    <p class="text-muted" style="margin-bottom: 16px;">
                        You are running Pterodactyl Panel version <code>{{ config('app.version') }}</code>. Your panel is up-to-date with the latest release!
                    </p>
                @else
                    <p style="margin-bottom: 16px;">
                        Your panel is <strong>not up-to-date!</strong> The latest version is <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank"><code>{{ $version->getPanel() }}</code></a> and you are running <code>{{ config('app.version') }}</code>. Update instructions can be found <a href="https://pterodactyl.io/panel/1.0/updating.html" target="_blank">here</a>.
                    </p>
                @endif
                <div class="row">
                    <div class="col-xs-6 col-sm-3 text-center" style="margin-bottom: 6px;">
                        <a href="{{ $version->getDiscord() }}" target="_blank" class="btn btn-default btn-sm btn-block">
                            <i class="fa fa-support text-yellow"></i> Discord
                        </a>
                    </div>
                    <div class="col-xs-6 col-sm-3 text-center" style="margin-bottom: 6px;">
                        <a href="https://pterodactyl.io" target="_blank" class="btn btn-default btn-sm btn-block">
                            <i class="fa fa-book text-blue"></i> Docs
                        </a>
                    </div>
                    <div class="col-xs-6 col-sm-3 text-center" style="margin-bottom: 6px;">
                        <a href="https://github.com/pterodactyl/panel" target="_blank" class="btn btn-default btn-sm btn-block">
                            <i class="fa fa-github"></i> GitHub
                        </a>
                    </div>
                    <div class="col-xs-6 col-sm-3 text-center" style="margin-bottom: 6px;">
                        <a href="{{ $version->getDonations() }}" target="_blank" class="btn btn-default btn-sm btn-block">
                            <i class="fa fa-heart text-red"></i> Sponsor
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-dashboard"></i> Panel Storage & System Load</h3>
            </div>
            <div class="box-body">
                <div>
                    <strong>Panel Storage Disk</strong>
                    <span class="pull-right text-muted">{{ $system['disk_used_human'] }} / {{ $system['disk_total_human'] }} ({{ $system['disk_percent'] }}%)</span>
                    <div class="progress progress-xs" style="margin-top: 6px; margin-bottom: 14px; background: rgba(0,0,0,0.25);">
                        <div class="progress-bar progress-bar-{{ $system['disk_percent'] > 90 ? 'danger' : ($system['disk_percent'] > 75 ? 'warning' : 'primary') }}" style="width: {{ $system['disk_percent'] }}%"></div>
                    </div>
                </div>
                <table class="table table-hover table-condensed" style="margin-bottom: 0;">
                    <tbody>
                        <tr>
                            <td><strong>System Load (1m, 5m, 15m)</strong></td>
                            <td class="text-right">
                                @if(is_array($system['load_avg']))
                                    <span class="label label-default">{{ round($system['load_avg'][0], 2) }}</span>
                                    <span class="label label-default">{{ round($system['load_avg'][1], 2) }}</span>
                                    <span class="label label-default">{{ round($system['load_avg'][2], 2) }}</span>
                                @else
                                    <span class="text-muted">Not Available</span>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Server Time</strong></td>
                            <td class="text-right"><span class="text-muted">{{ $system['server_time'] }}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-6 col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-cogs"></i> System & Environment</h3>
            </div>
            <div class="box-body no-padding table-responsive">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <td style="width: 40%;"><strong>Operating System</strong></td>
                            <td><code>{{ $system['os'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Host Name</strong></td>
                            <td><code>{{ $system['hostname'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>PHP Version</strong></td>
                            <td>
                                <span class="label label-primary">PHP {{ $system['php_version'] }}</span>
                                @if($system['opcache_enabled'])
                                    <span class="label label-success" title="OPcache is active">OPcache</span>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Laravel Version</strong></td>
                            <td><code>{{ $system['laravel_version'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Memory Limit</strong></td>
                            <td><code>{{ $system['memory_limit'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Execution / Upload Limit</strong></td>
                            <td><code>{{ $system['max_execution_time'] }}</code> &bull; <code>Upload: {{ $system['upload_max_filesize'] }}</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-database"></i> Services & Drivers</h3>
            </div>
            <div class="box-body no-padding table-responsive">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <td style="width: 40%;"><strong>Database Engine</strong></td>
                            <td>
                                <span class="label label-info">{{ strtoupper($system['db_driver']) }}</span>
                                <code style="margin-left: 4px;">{{ $system['db_version'] }}</code>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Queue Driver</strong></td>
                            <td><code>{{ $system['queue_driver'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Cache Driver</strong></td>
                            <td><code>{{ $system['cache_driver'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Session Driver</strong></td>
                            <td><code>{{ $system['session_driver'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Mail Driver</strong></td>
                            <td><code>{{ $system['mail_driver'] }}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Total Databases Created</strong></td>
                            <td><span class="badge bg-purple">{{ number_format($stats['databases']) }}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Live Activity & Audit Log --}}
<div class="row">
    <div class="col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-history"></i> Recent Activity Log</h3>
                <div class="box-tools pull-right">
                    <span class="text-muted" style="font-size: 11px;">Latest 8 recorded security & system events</span>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                @if($activityLogs->count() > 0)
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th style="width: 15%;">User</th>
                                <th style="width: 35%;">Action / Event</th>
                                <th style="width: 25%;">IP Address</th>
                                <th style="width: 25%;" class="text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($activityLogs as $log)
                                <tr>
                                    <td>
                                        @if($log->actor)
                                            <a href="{{ route('admin.users.view', $log->actor->id) }}">
                                                <i class="fa fa-user text-muted"></i> <strong>{{ $log->actor->username }}</strong>
                                            </a>
                                        @else
                                            <span class="text-muted"><i class="fa fa-cog"></i> System</span>
                                        @endif
                                    </td>
                                    <td>
                                        <code style="font-size: 11px;">{{ $log->event }}</code>
                                        @if($log->description)
                                            <span class="text-muted" style="margin-left: 6px; font-size: 12px;">{{ $log->description }}</span>
                                        @endif
                                    </td>
                                    <td>
                                        <code>{{ $log->ip }}</code>
                                    </td>
                                    <td class="text-right text-muted" title="{{ $log->timestamp->format('Y-m-d H:i:s T') }}">
                                        {{ $log->timestamp->diffForHumans() }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div style="padding: 24px; text-align: center;" class="text-muted">
                        <i class="fa fa-info-circle"></i> No activity logs recorded yet.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

@if($nodes->count() > 0)
<div class="row">
    <div class="col-xs-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-sitemap"></i> Nodes Quick Overview</h3>
                <div class="box-tools">
                    <a href="{{ route('admin.nodes') }}" class="btn btn-xs btn-primary">View All Nodes</a>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Node Name</th>
                            <th>Location</th>
                            <th>FQDN</th>
                            <th>Memory Allocation</th>
                            <th>Disk Allocation</th>
                            <th class="text-center">Servers</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($nodes as $node)
                            @php
                                $memPercent = ($node->memory > 0 && isset($node->allocated_memory)) ? round(($node->allocated_memory / $node->memory) * 100, 1) : 0;
                                $diskPercent = ($node->disk > 0 && isset($node->allocated_disk)) ? round(($node->allocated_disk / $node->disk) * 100, 1) : 0;
                            @endphp
                            <tr>
                                <td>
                                    @if($node->maintenance_mode)
                                        <span class="label label-warning">Maintenance</span>
                                    @else
                                        <span class="label label-success">Operational</span>
                                    @endif
                                </td>
                                <td><strong><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a></strong></td>
                                <td>{{ $node->location ? $node->location->short : 'N/A' }}</td>
                                <td><code>{{ $node->fqdn }}</code></td>
                                <td style="min-width: 140px;">
                                    <small class="text-muted">{{ number_format($node->allocated_memory ?? 0) }} / {{ number_format($node->memory) }} MiB ({{ $memPercent }}%)</small>
                                    <div class="progress progress-xs" style="margin-top: 3px; margin-bottom: 0; background: rgba(0,0,0,0.25);">
                                        <div class="progress-bar progress-bar-{{ $memPercent > 90 ? 'danger' : ($memPercent > 75 ? 'warning' : 'primary') }}" style="width: {{ min(100, $memPercent) }}%"></div>
                                    </div>
                                </td>
                                <td style="min-width: 140px;">
                                    <small class="text-muted">{{ number_format($node->allocated_disk ?? 0) }} / {{ number_format($node->disk) }} MiB ({{ $diskPercent }}%)</small>
                                    <div class="progress progress-xs" style="margin-top: 3px; margin-bottom: 0; background: rgba(0,0,0,0.25);">
                                        <div class="progress-bar progress-bar-{{ $diskPercent > 90 ? 'danger' : ($diskPercent > 75 ? 'warning' : 'primary') }}" style="width: {{ min(100, $diskPercent) }}%"></div>
                                    </div>
                                </td>
                                <td class="text-center"><span class="badge bg-blue">{{ $node->servers_count }}</span></td>
                                <td class="text-right">
                                    <a href="{{ route('admin.nodes.view', $node->id) }}" class="btn btn-xs btn-default">
                                        <i class="fa fa-eye"></i> View
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endif
@endsection
