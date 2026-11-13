<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Throwable;
use Illuminate\View\View;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Database;
use Pterodactyl\Models\Allocation;
use Pterodactyl\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

class BaseController extends Controller
{
    /**
     * BaseController constructor.
     */
    public function __construct(private SoftwareVersionService $version)
    {
    }

    /**
     * Format byte values into human-readable strings.
     */
    public function formatBytes(?float $bytes, int $precision = 2): string
    {
        if (!$bytes || $bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $i = (int) floor(log($bytes, 1024));

        return round($bytes / (1024 ** $i), $precision) . ' ' . ($units[$i] ?? 'B');
    }

    /**
     * Return the admin index view with enriched system and overview stats.
     */
    public function index(): View
    {
        $stats = [
            'servers' => [
                'total' => 0,
                'active' => 0,
                'suspended' => 0,
            ],
            'nodes' => [
                'total' => 0,
                'maintenance' => 0,
            ],
            'users' => [
                'total' => 0,
                'admins' => 0,
                '2fa' => 0,
            ],
            'allocations' => [
                'total' => 0,
                'assigned' => 0,
                'free' => 0,
            ],
            'databases' => 0,
        ];

        try {
            $stats['servers']['total'] = Server::count();
            $stats['servers']['active'] = Server::whereNull('status')->count();
            $stats['servers']['suspended'] = Server::where('status', 'suspended')->count();

            $stats['nodes']['total'] = Node::count();
            $stats['nodes']['maintenance'] = Node::where('maintenance_mode', true)->count();

            $stats['users']['total'] = User::count();
            $stats['users']['admins'] = User::where('root_admin', true)->count();
            $stats['users']['2fa'] = User::where('use_totp', true)->count();

            $stats['allocations']['total'] = Allocation::count();
            $stats['allocations']['assigned'] = Allocation::whereNotNull('server_id')->count();
            $stats['allocations']['free'] = max(0, $stats['allocations']['total'] - $stats['allocations']['assigned']);

            $stats['databases'] = Database::count();
        } catch (Throwable) {
            // Gracefully ignore database connection issues in local/offline modes
        }

        // Global cluster resource pool (all nodes vs all servers)
        $cluster = [
            'memory_total' => 0,
            'memory_allocated' => 0,
            'memory_percent' => 0,
            'memory_total_human' => '0 B',
            'memory_allocated_human' => '0 B',
            'disk_total' => 0,
            'disk_allocated' => 0,
            'disk_percent' => 0,
            'disk_total_human' => '0 B',
            'disk_allocated_human' => '0 B',
        ];

        try {
            $totalNodeMemMib = (int) Node::sum('memory');
            $totalServerMemMib = (int) Server::sum('memory');
            $memPercent = ($totalNodeMemMib > 0) ? round(($totalServerMemMib / $totalNodeMemMib) * 100, 1) : 0;

            $totalNodeDiskMib = (int) Node::sum('disk');
            $totalServerDiskMib = (int) Server::sum('disk');
            $diskPercent = ($totalNodeDiskMib > 0) ? round(($totalServerDiskMib / $totalNodeDiskMib) * 100, 1) : 0;

            $cluster = [
                'memory_total' => $totalNodeMemMib,
                'memory_allocated' => $totalServerMemMib,
                'memory_percent' => $memPercent,
                'memory_total_human' => $this->formatBytes($totalNodeMemMib * 1024 * 1024),
                'memory_allocated_human' => $this->formatBytes($totalServerMemMib * 1024 * 1024),
                'disk_total' => $totalNodeDiskMib,
                'disk_allocated' => $totalServerDiskMib,
                'disk_percent' => $diskPercent,
                'disk_total_human' => $this->formatBytes($totalNodeDiskMib * 1024 * 1024),
                'disk_allocated_human' => $this->formatBytes($totalServerDiskMib * 1024 * 1024),
            ];
        } catch (Throwable) {
            // Keep default
        }

        // Database details
        $dbDriver = config('database.default', 'mysql');
        $dbVersion = 'Unknown';
        try {
            $pdo = DB::connection()->getPdo();
            $dbVersion = $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION);
        } catch (Throwable) {
            // Keep default
        }

        // Panel storage disk stats
        $diskPath = base_path();
        $diskFree = @disk_free_space($diskPath);
        $diskTotal = @disk_total_space($diskPath);
        $diskUsed = ($diskTotal && $diskFree) ? max(0, $diskTotal - $diskFree) : null;
        $diskPercent = ($diskTotal && $diskUsed) ? round(($diskUsed / $diskTotal) * 100, 1) : 0;

        // System load
        $loadAvg = function_exists('sys_getloadavg') ? @sys_getloadavg() : null;

        $system = [
            'os' => php_uname('s') . ' ' . php_uname('r') . ' (' . php_uname('m') . ')',
            'hostname' => gethostname() ?: 'Unknown',
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'timezone' => config('app.timezone', 'UTC'),
            'server_time' => now()->format('Y-m-d H:i:s T'),
            'memory_limit' => ini_get('memory_limit') ?: 'N/A',
            'max_execution_time' => (ini_get('max_execution_time') !== false) ? ini_get('max_execution_time') . 's' : 'N/A',
            'upload_max_filesize' => ini_get('upload_max_filesize') ?: 'N/A',
            'post_max_size' => ini_get('post_max_size') ?: 'N/A',
            'opcache_enabled' => extension_loaded('Zend OPcache') && (bool) ini_get('opcache.enable'),
            'db_driver' => $dbDriver,
            'db_version' => $dbVersion,
            'queue_driver' => config('queue.default', 'sync'),
            'cache_driver' => config('cache.default', 'file'),
            'session_driver' => config('session.driver', 'file'),
            'mail_driver' => config('mail.default', 'smtp'),
            'disk_free_human' => $diskFree ? $this->formatBytes($diskFree) : 'N/A',
            'disk_used_human' => $diskUsed ? $this->formatBytes($diskUsed) : 'N/A',
            'disk_total_human' => $diskTotal ? $this->formatBytes($diskTotal) : 'N/A',
            'disk_percent' => $diskPercent,
            'load_avg' => $loadAvg,
        ];

        // Summary list of nodes with allocated RAM & Disk sums
        $nodes = collect();
        try {
            $nodes = Node::with('location')
                ->withCount('servers')
                ->withSum('servers as allocated_memory', 'memory')
                ->withSum('servers as allocated_disk', 'disk')
                ->limit(10)
                ->get();
        } catch (Throwable) {
            // Keep empty collection
        }

        // Recent activity / audit logs
        $activityLogs = collect();
        try {
            $activityLogs = ActivityLog::with('actor')
                ->latest('timestamp')
                ->limit(8)
                ->get();
        } catch (Throwable) {
            // Keep empty collection
        }

        return view('admin.index', [
            'version' => $this->version,
            'stats' => $stats,
            'cluster' => $cluster,
            'system' => $system,
            'nodes' => $nodes,
            'activityLogs' => $activityLogs,
        ]);
    }
}
